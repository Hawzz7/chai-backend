import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}))//controls the data size or Controls the maximum request body size. If this is a number, then the value specifies the number of bytes; if it is a string, the value is passed to the bytes library for parsing. Defaults to '100kb'.

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
})) //will handle all the request made by url e.g. when someone search for "Narendra Modi" in google then the urlencoded will parse the search thing into a readable format 

app.use(express.static("public"))
app.use(cookieParser())


export { app }