const { z } = require("zod");

const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }
  next();
};

module.exports = { validateRequest };
