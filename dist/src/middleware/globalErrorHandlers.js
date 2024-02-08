"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomError_1 = __importDefault(require("../errors/CustomError"));
const InfoError_1 = __importDefault(require("../errors/InfoError"));
const AuthTokenError_1 = __importDefault(require("../errors/AuthTokenError"));
const errorHandler = (err, req, res, next) => {
    if (err instanceof CustomError_1.default) {
        return res.status(err.errorCode).send({ success: false, errors: err.serializeErrors() });
    }
    if (err instanceof InfoError_1.default) {
        return res.status(err.errorCode).send({ success: false, errors: err.serializeErrors() });
    }
    if (err instanceof AuthTokenError_1.default) {
        return res.status(err.errorCode).send({ success: false, errors: err.serializeErrors() });
    }
    res.status(400).send({ success: false, error: [{ message: "Some error occured" }] });
};
exports.default = errorHandler;
