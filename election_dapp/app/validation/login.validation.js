const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateLoginInput(data) {
    let errors = "";
    
    if (Validator.isEmpty(data.username)) {
        errors= "Email field is required";
    } 
    else if (Validator.isEmpty(data.password)) {
        errors = "Password field is required";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};