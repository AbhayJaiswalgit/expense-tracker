const joi = require("joi");

const expenseValidation = (req, res, next) => {
  const Schema = joi.object({
    title: joi.string().required(),
    amount: joi.number().min(0).required(),
    date: joi.date().required(),
    category: joi.string().min(1).required(),
  });

  const { error } = Schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Bad Request", error: error.details[0].message });
  }
  next();
};

module.exports = expenseValidation;
