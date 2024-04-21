import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
//origin: process.env.CORS_ORIGIN: This option specifies the allowed origins for cross-origin requests. process.env.CORS_ORIGIN likely retrieves the value from an environment variable. The CORS_ORIGIN environment variable should contain the allowed origin(s) for cross-origin requests. If the value of CORS_ORIGIN is '*', it allows requests from any origin. If it's a specific origin (e.g., 'http://example.com'), it allows requests only from that origin.

app.use(express.json({limit: "16kb"}))//controls the data size or Controls the maximum request body size. If this is a number, then the value specifies the number of bytes; if it is a string, the value is passed to the bytes library for parsing. Defaults to '100kb'.

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
})) //will handle all the request made by url e.g. when someone search for "Narendra Modi" in google then the urlencoded will parse the search thing into a readable format 

app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from "./routes/user.routes.js"


//routes declaration
app.use("/api/v1/users", userRouter)


export { app }