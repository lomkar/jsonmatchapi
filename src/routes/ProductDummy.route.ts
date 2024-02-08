import express, { Request, Response } from "express";
import { uploadMiddleWare } from "../middleware/fileUpload";
import {
  bulkUploadProductDummy,
  getAllProducts,
  uploadFileProduct,
} from "../controllers/ProductDummy.controller";
const router = express.Router();

router.post(
  "/uploadfile",
  uploadMiddleWare.single("file"),
  uploadFileProduct
);

router.post("/bulkuploadproductdummy", bulkUploadProductDummy);
router.get("/getallproducts", getAllProducts);
export default router;
