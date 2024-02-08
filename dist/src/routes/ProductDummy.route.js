"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUpload_1 = require("../middleware/fileUpload");
const ProductDummy_controller_1 = require("../controllers/ProductDummy.controller");
const router = express_1.default.Router();
router.post("/uploadfile", fileUpload_1.uploadMiddleWare.single("file"), ProductDummy_controller_1.uploadFileProduct);
router.post("/bulkuploadproductdummy", ProductDummy_controller_1.bulkUploadProductDummy);
router.get("/getallproducts", ProductDummy_controller_1.getAllProducts);
exports.default = router;
