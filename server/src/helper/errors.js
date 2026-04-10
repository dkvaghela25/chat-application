import { ValidationErrorCode, RequestInputErrorCode, AuthenticationErrorCode } from "./constants.js";

class ValidationError extends Error { // when user enter wrong data then display validation error to user
    constructor(message, code = ValidationErrorCode) {
        super(message);
        this.error_code = code;
        this.response_data = {
            success: false,
            validation_error: true,
            message: message
        };
    }
}

class RequestInputError extends Error { // when something is wrong in request but it's not user's issue
    constructor(message, code = RequestInputErrorCode) {
        super(message);
        this.error_code = code;
        this.response_data = {
            success: false,
            error: true,
            message: message

        };
    }
}

class AuthenticationError extends Error { // when something is wrong in request but it's not user's issue
    constructor(message, code = AuthenticationErrorCode) {
        super(message);
        this.error_code = code;
        this.response_data = {
            success: false,
            authentication_error: true,
            message: message
        };
    }
}

export {
    ValidationError,
    RequestInputError,
    AuthenticationError
};