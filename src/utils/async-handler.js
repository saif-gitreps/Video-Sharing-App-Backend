// promise way.
const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
   };
};

module.exports = asyncHandler;

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
