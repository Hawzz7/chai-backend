//we made a custom error class component "ApiError" extends from built-in "Error" class in javascript. By doing this, ApiError inherits all properties and methods from the Error class.
class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack= "",
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}

/*
//Stack :-
In JavaScript, the stack property is a property of Error objects that contains a string representing the stack trace of the error. The stack trace provides information about the sequence of nested function calls that led to the error, including file names, line numbers, and column numbers.

The stack trace is useful for debugging purposes, as it helps developers trace the origin of an error and understand the sequence of function calls that led to it. It allows developers to identify where in the code the error occurred and to diagnose the cause of the error more effectively.
*/