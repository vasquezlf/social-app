// This file contains validation logic for post
// Validate email and password
const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  // Store errors as object
  let errors = {};

  // Use custom validation from ./is-empty
  data.text = !isEmpty(data.text) ? data.text : "";

  if(!Validator.isLength(data.text, { min: 10, max: 280 })) {
    errors.password = "Post must be between 10 and 280 characters."
  }

  if(Validator.isEmpty(data.text)) {
    errors.password = "Text field is required."
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
}
