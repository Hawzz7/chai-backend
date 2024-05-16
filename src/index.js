// require('dotenv').config({path: './env'});
import dotenv from "dotenv" //another way to use dotenv file using import syntax to maintain consistency
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({ path: './.env' })




connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => { 
          console.log(`Server is running at port: ${process.env.PORT}`);  
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })


















    /*
//Approach-1: How to connect to DataBase
import express from "express";
const app = express()

//Using IIFE(Immediately invoked function express) syntax to connect to  the Database immediately
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})()
*/