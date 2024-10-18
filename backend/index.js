require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');


const { userRouter }= require("./routes/user");
const { todoRouter } = require("./routes/todo");

const app = express();
const port = 3000;

app.use(express.json());

app.use("/user" ,userRouter)
app.use("/todo" ,todoRouter)

app.get("/healthy", (req, res)=> res.send("I am Healthy"));

//  start writing your routes here

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(3000);
    console.log(`Listening on port${port}`)
}

main();