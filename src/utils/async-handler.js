// promise way.
const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
   };
};

module.exports = asyncHandler;

// another way is to use asyn await, for that we one step deeper function.
const asyncHandler2 = (fn) => async (req, res, next) => {
   try {
      await fn(req, res, next);
   } catch (error) {
      res.status(err.code || 500).json({
         success: false,
         message: err.message,
      });
   }
};

// more simplified way of this wrapper.
function asyncHandler3(fn) {
   return async function (req, res, next) {
      try {
         await fn(req, res, next);
      } catch (error) {
         res.status(error.code || 500).json({
            success: false,
            message: error.message,
         });
      }
   };
}
