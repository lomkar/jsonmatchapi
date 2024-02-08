"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUpload_1 = require("../middleware/fileUpload");
const UserDummy_controller_1 = require("../controllers/UserDummy.controller");
const router = express_1.default.Router();
router.post("/uploadfile", fileUpload_1.uploadMiddleWare.single("file"), UserDummy_controller_1.uploadFile);
router.post("/bulkuploaduserdummy", UserDummy_controller_1.bulkUploadUserDummy);
router.get("/getallusers", UserDummy_controller_1.getAllUsers);
exports.default = router;
