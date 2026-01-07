// backend/src/middleware/index.js
const { authenticate } = require("./authenticate");
const { checkRole } = require("./checkRole");
const { errorHandler, notFoundHandler } = require("./errorHandler");
module.exports = {
  authenticate,
  checkRole,
  errorHandler,
  notFoundHandler,
};
