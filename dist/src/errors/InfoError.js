"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomError_1 = __importDefault(require("./CustomError"));
class InfoError extends CustomError_1.default {
    constructor(message) {
        super(message);
        this.errorCode = 400;
        this.errorType = "INFO_ERROR";
        Object.setPrototypeOf(this, InfoError.prototype);
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.default = InfoError;
