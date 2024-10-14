module.exports = function (handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res); // Await the async operation
      } catch (ex) {
        next(ex); // Pass any error to Express's error-handling middleware
      }
    };
  };
  