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
exports.authMiddleware = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const cognitoIdentityServiceProvider = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
    region: process.env.AWS_S3_REGION,
});
const aws_jwt_verify_1 = require("aws-jwt-verify");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const config_1 = require("../config");
const AuthTokenError_1 = __importDefault(require("../errors/AuthTokenError"));
const userPoolId = config_1.config.userPoolId;
const userPoolClientId = config_1.config.userPoolClientId;
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization;
    if (!token)
        throw new AuthTokenError_1.default("No token provided");
    const jwtToken = token.replace("Bearer ", "");
    verifyToken(jwtToken)
        .then((valid) => __awaiter(void 0, void 0, void 0, function* () {
        if (valid) {
            getCognitoUser(jwtToken).then((email) => __awaiter(void 0, void 0, void 0, function* () {
                let user = yield prisma.user.findFirst({
                    where: {
                        email: email,
                    },
                    select: {
                        id: true,
                        email: true,
                        cognitouserid: true,
                    },
                });
                if (!user) {
                    throw new AuthTokenError_1.default("User does not exists");
                }
                req.user = {
                    cognitouserid: user.cognitouserid || "",
                    email: user.email || "",
                    id: user.id,
                };
                next();
            }));
        }
        else {
            throw Error("Not valid Token");
        }
    }))
        .catch((error) => {
        return res.json({
            isAuth: false,
            error: true,
        });
    });
});
exports.authMiddleware = authMiddleware;
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // Verifier that expects valid access tokens:
    const verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
        userPoolId: userPoolId,
        tokenUse: "access",
        clientId: userPoolClientId,
    });
    try {
        const payload = yield verifier.verify(token);
        return true;
    }
    catch (_a) {
        console.log("Token not valid!");
        return false;
    }
});
const getCognitoUser = (jwtToken) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const params = {
        AccessToken: jwtToken,
    };
    const command = new client_cognito_identity_provider_1.GetUserCommand(params);
    const response = yield cognitoIdentityServiceProvider.send(command);
    let email = (_c = (_b = response.UserAttributes) === null || _b === void 0 ? void 0 : _b.find((f) => f.Name === "email")) === null || _c === void 0 ? void 0 : _c.Value;
    if (email) {
        return email;
    }
});
