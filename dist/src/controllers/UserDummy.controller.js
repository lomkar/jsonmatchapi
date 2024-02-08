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
exports.getAllUsers = exports.bulkUploadUserDummy = exports.addUserDummy = exports.uploadFile = void 0;
const client_1 = require("@prisma/client");
const InfoError_1 = __importDefault(require("../errors/InfoError"));
const short = require("short-uuid");
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const fs = require("fs");
const prisma = new client_1.PrismaClient();
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!(req === null || req === void 0 ? void 0 : req.file)) {
            throw new InfoError_1.default("please upload a file");
        }
        let data = {
            url: "",
            type: "",
            filename: "",
        };
        if (!!(req === null || req === void 0 ? void 0 : req.file)) {
            data = {
                url: (_a = req.file) === null || _a === void 0 ? void 0 : _a.location,
                type: req.file.mimetype,
                filename: req.file.key,
            };
        }
        return res.status(201).json({
            uploaded: true,
            success: true,
            message: "File uploaded successfully",
            data: data,
        });
    }
    catch (error) {
        console.log("Error  uploadFile API", error);
        throw new InfoError_1.default(error);
    }
});
exports.uploadFile = uploadFile;
const addUserDummy = (user) => __awaiter(void 0, void 0, void 0, function* () {
    //   const { user } = req.body;
    const PAT = "6182277373794da983af190720e4574d";
    const USER_ID = "openai";
    const APP_ID = "dall-e";
    const MODEL_ID = "dall-e-3";
    const MODEL_VERSION_ID = "dc9dcb6ee67543cebc0b9a025861b868";
    const RAW_TEXT = `${user.gender} user profile image with hyper realistic`;
    const stub = ClarifaiStub.grpc();
    const metadata = new grpc.Metadata();
    metadata.set("authorization", "Key " + PAT);
    console.log("Started creating Image via DAll-e");
    stub.PostModelOutputs({
        user_app_id: {
            user_id: USER_ID,
            app_id: APP_ID,
        },
        model_id: MODEL_ID,
        version_id: MODEL_VERSION_ID,
        inputs: [
            {
                data: {
                    text: {
                        raw: RAW_TEXT,
                    },
                },
            },
        ],
    }, metadata, (err, response) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            throw new Error(err);
        }
        if (response.status.code !== 10000) {
            throw new Error("Post models failed, status: " + response.status.description);
        }
        const output = response.outputs[0].data.image.base64;
        console.log("Start saving to aws s3");
        const url = yield saveImageAPI(output);
        if (url) {
            let photolurl = [];
            photolurl.push(url);
            console.log("Saving to database");
            try {
                const newUser = yield prisma.userDummy.create({
                    data: {
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        gender: user.gender,
                        profilePhoto: photolurl,
                        address: {
                            create: {
                                street: user.address.street,
                                suite: user.address.suite,
                                city: user.address.city,
                                zipcode: user.address.zipcode,
                                geo: {
                                    create: {
                                        lat: user.address.geo.lat,
                                        lng: user.address.geo.lng,
                                    },
                                },
                            },
                        },
                        phone: user.phone,
                        website: user.website,
                        company: {
                            create: {
                                name: user.company.name,
                                catchPhrase: user.company.catchPhrase,
                                bs: user.company.bs,
                            },
                        },
                    },
                    include: {
                        address: {
                            include: {
                                geo: true,
                            },
                        },
                        company: true,
                    },
                });
                //   return res.json({
                //     status: true,
                //     data: newUser,
                //   });
                return newUser;
            }
            catch (error) {
                console.log(error);
            }
        }
    }));
});
exports.addUserDummy = addUserDummy;
const axios = require("axios");
function saveImageAPI(output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const formData = new FormData();
            const blob = new Blob([output], { type: "image/png" });
            formData.append("file", blob, "image.png");
            const config = {
                headers: { "Content-Type": "multipart/form-data" },
            };
            const result = yield axios.post("http://localhost:3001/api/user/uploadfile", formData, config);
            const url = result.data.data.url;
            return url;
        }
        catch (err) {
            console.log(err);
            return null;
        }
    });
}
const bulkUploadUserDummy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let newUsersArray = [];
        let { users } = req.body;
        for (let i = 0; i < users.length; i++) {
            console.log("Started user => ", users[i].name);
            let newUser = yield (0, exports.addUserDummy)(users[i]);
            newUsersArray.push(newUser);
        }
        return res.status(201).json({
            success: true,
            data: newUsersArray,
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.bulkUploadUserDummy = bulkUploadUserDummy;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.userDummy.findMany();
    res.json({ users });
});
exports.getAllUsers = getAllUsers;
