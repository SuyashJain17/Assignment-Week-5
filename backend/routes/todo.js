const { Router } = require("express");
const { TodoModel } = require("../database/db");
const todoRouter = Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { JWT_ADMIN_PASSWORD } = require('../config');
const { adminMiddleware } = require("../middleware/user");
const { z } = require('zod');

// todo Routes
todoRouter.post('/create', async (req, res) => {
    // Implement create todo  logic
    const {title, description, status, priority, user} = req.body;
    const requireBody = z.object({
        title: z.string(),
        description: z.string(),
        status: z.string(),
        priority: z.string(),
        user: z.string(),
    })

    const parseData = requireBody.safeParse(req.body);
    if(!parseData.success) {
        res.json({
            message: "Incorrect format",
            error: parseData.error
        })
        return
    }
    try {
        const title = req.body.title;
        const description = req.body.description;
        const status = req.body.status;
        const priority = req.body.priority;
        const user = req.body.user;

        await TodoModel.create({
            title: title,
            description: description,
            status: status,
            priority: priority,
            user: user,
        })

        const token = jwt.sign({
            id: user._id
        }, JWT_ADMIN_PASSWORD)
        await TodoModel.findOneAndUpdate ({
            title,
        },{
            token:token
        });
        return res.json({ token,message: "todo created" });

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "server error"
        })
    }
});

todoRouter.put('/update/:id', adminMiddleware, async (req, res) => {
    // Extract ID from the URL
    const todoId = req.params.id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }
    // Extract fields from the body
    const { title, description, status, priority, user } = req.body;

    // Validation schema using zod
    const requireBody = z.object({
        title: z.string().optional(), // Allow optional fields for partial updates
        description: z.string().optional(),
        status: z.enum(['pending', 'in-progress', 'completed']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        user: z.string().optional(),
    });

    // Validate the body using zod
    const parseData = requireBody.safeParse(req.body);
    if (!parseData.success) {
        return res.json({
            message: "Incorrect format",
            error: parseData.error,
        });
    }

    try {
        // Check if the to-do exists
        const existingTodo = await TodoModel.findById(todoId);
        if (!existingTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        // Update the fields if they exist in the request body
        const updatedFields = {
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status }),
            ...(priority && { priority }),
            ...(user && { user }),
        };

        // Find the to-do by ID and update it
        const updatedTodo = await TodoModel.findByIdAndUpdate(
            todoId,
            updatedFields,
            { new: true }
        );

        // Generate a new JWT token if necessary (for example, if the user is updated)
        let token;
        if (user) {
            token = jwt.sign({ id: updatedTodo.user }, JWT_ADMIN_PASSWORD);
            // Optionally, update the token field in the to-do
            await TodoModel.findByIdAndUpdate(todoId, { token });
        }

        return res.json({
            message: "Todo updated successfully",
            todo: updatedTodo,
            ...(token && { token }), // Send the token only if it's been regenerated
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
});

todoRouter.delete('/del', adminMiddleware, async (req, res) => {
    // Implement delete todo logic 
    const {title} = req.body;
    
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        const deleteTodo = await TodoModel.deleteOne({title});

        if (deleteTodo.deletedCount === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        
        return res.json({ message: "Todo deleted successfully"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
});

todoRouter.delete('/del/:id', adminMiddleware, async (req, res) => {
    // Implement delete todo by id logic
    const todoId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const deleteTodo = await TodoModel.findByIdAndDelete(todoId);

        if (!deleteTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        return res.json({ message: "Todo deleted successfully", todo: deleteTodo });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
});


todoRouter.get('/get', adminMiddleware, async (req, res) => {
    // Implement fetching all todo logic
    try {
        const todos = await TodoModel.find(); // Fetch all todos
        res.json(todos); // Send all todos back in the response
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

todoRouter.get('/get/:id', adminMiddleware, async(req, res) => {
    // Implement fetching todo by id logic
    const todoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try{
        const getTodo = await TodoModel.findById(todoId);
        res.json({getTodo})
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = {
    todoRouter: todoRouter
} 