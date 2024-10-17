const { Router } = require("express");
const { UserModel, TodoModel } = require("../database/db");
const userRouter = Router();
const jwt = require('jsonwebtoken');
const { JWT_USER_PASSWORD } = require('../config');
const { userMiddleware } = require("../middleware/user");
const bcrypt = require("bcrypt");
const { z } = require('zod');

// User Routes
userRouter.post('/signup', async function(req, res) {
    const { username, email, password, todo, role } = req.body;
    const requireBody = z.object({
        username: z.string(),
        email: z.string(),
        password: z.string().min(3).max(100)
        .regex(/[A-Z]/, "password must contain at least one uppercase letter")
        .regex(/[a-z]/, "password must contain at least one lowercase letter")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character."),
        todo: z.string(),
        role: z.string(),
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
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const todo = req.body.todo;
        const role = req.body.role;

        const hashpassword = await bcrypt.hash(password, 5);
        console.log(hashpassword)

        await UserModel.create({
            username,
            email,
            password: hashpassword,
            todo,
            role,
        })
        res.json({
            message: "Signup success"
        })
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "server error"
        })
    }
});

userRouter.post('/login', async function (req, res) {
    try {
        const {email, password} = req.body;
        const user = await UserModel.findOne({
            email,
        });

        if(!user) {
            return res.status(403).json({
                message: "User does not exist in our database"
            })
        }
        // compare password
        const passwordMatch = await bcrypt.compare(password, user.password)
        
        if(passwordMatch) {
            const token = jwt.sign({
                id: user._id.toString()
            }, JWT_USER_PASSWORD)
            await UserModel.findOneAndUpdate ({
                email,
            },{
                token:token
            });
            return res.json({ token })
        } else {
            return res.status(403).json({
                message: "Incorrect Credentials"
            });
        }
    } catch(error) {
        return res.status(500).json({
            message: "An error occurred",
            error: error.message
        });
    }
});

userRouter.get('/todos', userMiddleware, async(req, res) => {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId,
    })
    res.json({
        todos
    });
});

userRouter.post('/logout', userMiddleware, async (req, res) => {
    const {email, password, token} = req.body;
    const user = await UserModel.findOne({
        email,
    });
    if(!user) {
        return res.status(403).json({
            message: "User does not exist in our database"
        })
    }

    const deleteUser = await UserModel.findOneAndUpdate({
        email, 
    }, {
        token: ""
    })
    res.json({
        message: "logout"
    })
});


module.exports = {
    userRouter: userRouter
} 