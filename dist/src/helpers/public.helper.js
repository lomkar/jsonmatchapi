"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfJSON = exports.generateUniqueIdToJson = void 0;
const uuid_1 = require("uuid");
const InfoError_1 = __importDefault(require("../errors/InfoError"));
function generateIds(data) {
    if (Array.isArray(data)) {
        data.forEach((i) => {
            // i.id = new Date().toString();
            return generateIds(i);
        });
    }
    else if (typeof data === "object" && data !== null) {
        let ifIdPresent = false;
        for (const key in data) {
            if (data.hasOwnProperty("id")) {
                ifIdPresent = true;
            }
        }
        if (!ifIdPresent) {
            data.id = (0, uuid_1.v4)();
        }
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                if (Array.isArray(value) ||
                    (typeof value === "object" && value !== null)) {
                    generateIds(value);
                }
            }
        }
        return data;
    }
    else {
        return data;
    }
    return data;
}
// addIdRecursively(data);
const generateUniqueIdToJson = (obj) => {
    return generateIds(obj);
};
exports.generateUniqueIdToJson = generateUniqueIdToJson;
const checkIfJSON = (text) => {
    if (typeof text !== "string") {
        throw new InfoError_1.default("Not a valid json");
        return false;
    }
    try {
        JSON.parse(text);
        return true;
    }
    catch (error) {
        console.log("ERROR", error);
        throw new InfoError_1.default("Not a valid json");
        return false;
    }
};
exports.checkIfJSON = checkIfJSON;
