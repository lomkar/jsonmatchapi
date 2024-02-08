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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const app = (0, express_1.default)();
const client_1 = require("@prisma/client");
// import examRoute from "./src/routes/exam.route";
const UserDummy_route_1 = __importDefault(require("./src/routes/UserDummy.route"));
const ProductDummy_route_1 = __importDefault(require("./src/routes/ProductDummy.route"));
const globalErrorHandlers_1 = __importDefault(require("./src/middleware/globalErrorHandlers"));
const prisma = new client_1.PrismaClient();
const cors_1 = __importDefault(require("cors"));
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
    optionSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/api", (req, res) => {
    return res.json({
        success: true,
        message: "API is working",
    });
});
// app.use("/api/auth", authRoute);
// app.use("/api/file", fileRoute);
// app.use("/api/androidversion", androidversionRoute);
// app.use("/api/folder", folderRoute);
app.use("/api/user", UserDummy_route_1.default);
app.use("/api/product", ProductDummy_route_1.default);
app.post("/api/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.ratingProductDummy.deleteMany({});
        yield prisma.productDummy.deleteMany({});
    }
    catch (err) {
        console.log(err);
    }
}));
app.use("*", globalErrorHandlers_1.default);
app.listen(3001, () => {
    console.log(`Server running on port ${3001}`);
});
