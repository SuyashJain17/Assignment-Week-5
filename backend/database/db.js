const mongoose = require('mongoose');
const { string, boolean } = require('zod');
console.log("connected");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

// Define schemas

const UserSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password:{
        type: String,
        require: true 
    },
    todos: [{
        type: Schema.Types.ObjectId,
        ref: 'Todo'
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    token: String, 
});

const TodoSchema = new Schema({
    title: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    user: {
        type: String,
        // ref: 'User',
        required: true
    },
});

const UserModel = mongoose.model('User', UserSchema);
const TodoModel = mongoose.model('Todo', TodoSchema);

module.exports = {
    UserModel,
    TodoModel
}