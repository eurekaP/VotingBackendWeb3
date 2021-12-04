const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports.validateUpdateUserInput=(data)=> {
    let errors = {};
    data.firstname = !isEmpty(data.firstname) ? data.firstname : "";
    data.lastname = !isEmpty(data.lastname) ? data.lastname : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    if (Validator.isEmpty(data.firstname)) {
        errors.firstname = "First name field is required";
    }
    if (Validator.isEmpty(data.lastname)) {
        errors.lastname = "Last name field is required";
    }
    if (Validator.isEmpty(data.email)) {
        errors.email = "Email field is required";
    } else if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};
module.exports.validateResetPassword=(password)=>{
    let errors = "";
    if (!Validator.isLength(password, { min: 6, max: 30 })) {
        errors = "Password must be at least 6 characters";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};
