const AppError = require("../utils/AppError");

function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      throw new AppError("Validation failed", 400, result.error.flatten());
    }

    req.validated = result.data;
    next();
  };
}

module.exports = validate;
