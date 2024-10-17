const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://suayshjain1707:g7gLWauZs1345ZdH@cluster0.0cxrn.mongodb.net/todo');

const { userRouter }= require("./routes/user");
const { todoRouter } = require("./routes/todo");

const app = express();
const port = 3000;

app.use(express.json());

app.use("/user" ,userRouter)
app.use("/todo" ,todoRouter)

app.get("/healthy", (req, res)=> res.send("I am Healthy"));

//  start writing your routes here

app.listen(port, ()=> console.log(`server is running at http://localhost:${port}`));