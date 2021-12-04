const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateRegisterInput(data) {
    
    let errors = "";
    
    if (Validator.isEmpty(data.name)) {
        errors = "Name field is required";
    }
    else if (Validator.isEmpty(data.username)) {
        errors = "User name field is required";
    }
    else if (Validator.isEmpty(data.email)) {
        errors = "Email field is required";
    }
    else if (!Validator.isEmail(data.email)) {
        errors = "Email is invalid";
    }
    else if(Validator.isEmpty(data.phone)){
        errors = "Phone is invalid";
    } 
    else if(Validator.isEmpty(data.address)){
        errors = "Address is invalid";
    } 
    else if (Validator.isEmpty(data.password)) {
        errors = "Password field is required";
    }
    else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors = "Password must be at least 6 characters";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};