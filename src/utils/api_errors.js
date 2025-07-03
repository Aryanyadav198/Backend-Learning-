class ApiErrors extends Error {
    constructor(statuscode, message = "default message:-Something went wrong",stack = "", errors = null,) {
        super(message);
        this.success = false
        this.statuscode = statuscode;
        this.errors = errors;
        this.message = message;
        this.data = null
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
 
    }
}
export { ApiErrors }