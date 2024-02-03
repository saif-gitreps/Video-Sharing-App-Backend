class ApiError extends Error {
   constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
      super(message);
      this.statusCode = statusCode;
      // do some research on this data property.
      this.data = null;
      this.message = message;
      this.success = false;
      this.errors = errors;

      // do some research on this as well.
      if (stack) {
         this.stack = stack;
      } else {
         Error.captureStackTrace(this, this.constructor);
      }
   }
}

module.exports = ApiError;
