class ApiErrors extends Error {
    constructor(statuscode, stack = "", errors = null, message = "Something went wrong") {
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