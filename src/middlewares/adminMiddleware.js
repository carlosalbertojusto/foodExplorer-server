const AppError = require("../utils/AppError")

function adminMiddleware(roleToVerify) {
  return (request, response, next) => {
    const { role } = request.user

    if (roleToVerify.includes(role)) {
      throw new AppError("Unauthorized", 401)
    }

    return next()
  }
}

module.exports = adminMiddleware
