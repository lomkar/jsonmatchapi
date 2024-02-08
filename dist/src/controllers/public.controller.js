"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostPublicRequest = exports.GetPublicRequest = void 0;
const express_1 = __importDefault(require("express"));
const InfoError_1 = __importDefault(require("../errors/InfoError"));
const router = express_1.default.Router();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const GetPublicRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { publicId } = req.params;
        let publicJSONData = (yield prisma.publicJsonData.findFirst({
            where: {
                id: publicId,
            },
            select: {
                JsonData: true,
            },
        }));
        if (!publicJSONData) {
            throw new InfoError_1.default("No json found.");
        }
        return res.json({
            success: true,
            data: publicJSONData.data,
        });
    }
    catch (err) {
        console.log("Error in GetPublicRequest => ", err);
        throw new InfoError_1.default(err);
    }
});
exports.GetPublicRequest = GetPublicRequest;
const PostPublicRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (err) {
        console.log("Error in PostPublicRequest => ", err);
        throw new InfoError_1.default(err);
    }
});
exports.PostPublicRequest = PostPublicRequest;
