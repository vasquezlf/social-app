// This file contains a function that checks if value is empty
// Returns true value if empty
const isEmpty = (value) => {
  return(
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) || // Check if an and its keys are empty
    (typeof value === "string" && value.trim().length === 0)
  );
};

module.exports = isEmpty;
