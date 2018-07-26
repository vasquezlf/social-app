// This file contains validation logic for login
// Validate email and password
const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  // Store errors as object
  let errors = {};

  // Use custom validation from ./is-empty
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if(Validator.isEmpty(data.password)) {
    errors.password = "Email field is required."
  }

  if(!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid"
  }

  if(Validator.isEmpty(data.password)) {
    errors.password = "Password field is required."
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
}
