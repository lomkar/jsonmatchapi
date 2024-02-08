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
const express_1 = __importDefault(require("express"));
const InfoError_1 = __importDefault(require("../errors/InfoError"));
const router = express_1.default.Router();
const client_1 = require("@prisma/client");
const public_helper_1 = require("../helpers/public.helper");
const prisma = new client_1.PrismaClient();
const createPublicJson = () => {
    const subRouter = express_1.default.Router();
    subRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let newData = req.body;
            newData = (0, public_helper_1.generateUniqueIdToJson)(newData);
            const result = yield prisma.publicJsonData.create({
                data: {
                    JsonData: newData,
                },
                select: {
                    id: true,
                    JsonData: true,
                },
            });
            return res.json({
                success: true,
                data: { publicId: result.id, output: result.JsonData },
            });
        }
        catch (err) {
            console.log(err);
            throw new InfoError_1.default(err);
        }
    }));
    return subRouter;
};
const generateRoutes = (resource, resourceData) => {
    const subRouter = express_1.default.Router();
    if (Array.isArray(resourceData)) {
        subRouter.get("/", (req, res) => {
            return res.json(resourceData);
        });
    }
    else if (typeof resourceData === "object") {
        subRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const publicid = req.params.publicid;
                const dataResult = yield prisma.publicJsonData.findFirst({
                    where: {
                        id: publicid,
                    },
                    select: {
                        id: true,
                        JsonData: true,
                    },
                });
                if (!dataResult) {
                    throw new InfoError_1.default("No Data found");
                }
                if (dataResult.JsonData && typeof dataResult.JsonData === "object") {
                    const jsonData = dataResult.JsonData;
                    if (typeof jsonData[resource] !== "undefined") {
                        return res.json({
                            success: true,
                            publicid: dataResult.id,
                            data: jsonData[resource],
                        });
                    }
                    else {
                        return res.json({
                            success: false,
                            data: null,
                            error: `Property '${resource}' not found in JsonData.`,
                        });
                    }
                }
                else {
                    return res.json({
                        success: false,
                        data: null,
                        error: "JsonData is null or not an object.",
                    });
                }
                // if(typeof dataResult.JsonData === "object"){
                //     return res.json({
                //         success: true,
                //         publicid: dataResult.id,
                //         data: dataResult.JsonData[resource],
                //       });
                // }
            }
            catch (error) {
                console.error(error);
                throw new InfoError_1.default(error);
            }
        }));
        subRouter.put(`/`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            // const updatedData = req.body;
            // Object.assign(resourceData, updatedData);
            // res.json(resourceData);
            // const resourceId = parseInt(req.params.id);
            const updatedData = req.body;
            const publicid = req.params.publicid;
            const dataResult = yield prisma.publicJsonData.findFirst({
                where: {
                    id: publicid,
                },
                select: {
                    JsonData: true,
                },
            });
            if (!dataResult) {
                throw new InfoError_1.default("No Data found");
            }
            try {
                const updatedResource = yield prisma.publicJsonData.update({
                    where: { id: publicid },
                    data: { JsonData: Object.assign({}, updatedData) },
                    select: {
                        id: true,
                        JsonData: true,
                    },
                });
                return res.json({
                    success: true,
                    publicid: updatedResource.id,
                    data: updatedResource.JsonData,
                });
            }
            catch (error) {
                console.error(error);
                throw new InfoError_1.default(error);
            }
        }));
        subRouter.patch(`/`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            // const updatedProps = req.body;
            // Object.assign(resourceData, updatedProps);
            // res.json(resourceData);
            const publicid = req.params.publicid;
            const updatedFields = req.body;
            const dataResult = yield prisma.publicJsonData.findFirst({
                where: {
                    id: publicid,
                },
                select: {
                    JsonData: true,
                },
            });
            if (!dataResult) {
                throw new InfoError_1.default("No Data found");
            }
            try {
                const updatedResource = yield prisma.publicJsonData.update({
                    where: { id: publicid },
                    data: {
                        JsonData: Object.assign({}, updatedFields),
                    },
                    select: { JsonData: true, id: true },
                });
                return res.json({
                    success: true,
                    publicid: updatedResource.id,
                    data: updatedResource.JsonData,
                });
            }
            catch (error) {
                console.error(error);
                throw new InfoError_1.default(error);
            }
        }));
    }
    return subRouter; // Return the sub-router
};
const getPublicJsonRoute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { publicid } = req.params;
        const publicJSONData = yield prisma.publicJsonData.findFirst({
            where: {
                id: publicid,
            },
            select: {
                JsonData: true,
            },
        });
        // if (!publicJSONData || publicJSONData.JsonData === null) {
        //   return res.status(404).json({ error: "Data not found" });
        // }
        if (publicJSONData && publicJSONData.JsonData) {
            const jsonData = publicJSONData.JsonData;
            console.log("JSONDATA ", jsonData);
            // Create an array to hold all the sub-routers
            const resourceRouters = Object.keys(jsonData).map((resource) => {
                const resourceData = jsonData[resource];
                console.log("RD => ", resource);
                return generateRoutes(resource, resourceData);
            });
            // Combine the sub-routers into the main router
            resourceRouters.forEach((resourceRouter, index) => {
                console.log("HELLO OMKAR ", Object.keys(jsonData)[index]);
                router.use(`/public/:publicid/${Object.keys(jsonData)[index]}`, resourceRouter);
            });
        }
        router.use("/public", createPublicJson());
        // Respond with the main JSON data
        // res.json(jsonData);
        router(req, res, next); // Call the main router to handle the request
    }
    catch (err) {
        console.log("Err in getPublicJsonRoute API: ", err);
        throw new InfoError_1.default(err);
    }
});
exports.default = getPublicJsonRoute;
