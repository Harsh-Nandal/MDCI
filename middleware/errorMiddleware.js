// middlewares/errorMiddleware.js
const path = require("path");

exports.notFound = (req, res, next) => {
  res.status(404);
  res.render("error", {
    title: "Page Not Found",
    errorCode: 404,
    errorMessage: "The page you are looking for does not exist.",
    currentPath: req.path,
  });
};

exports.errorHandler = (err, req, res, next) => {
  console.error("❌ Internal Error:", err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);
  res.render("error", {
    title: "Server Error",
    errorCode: statusCode,
    errorMessage: err.message || "Something went wrong.",
    currentPath: req.path,
  });
};
