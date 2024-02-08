import express, { Request, Response } from "express";
import { uploadMiddleWare } from "../middleware/fileUpload";
import { authMiddleware } from "../middleware/auth";
import { addUserDummy, bulkUploadUserDummy, getAllUsers, uploadFile } from "../controllers/UserDummy.controller";
const router = express.Router();

router.post(
  "/uploadfile",
  uploadMiddleWare.single("file"),
  uploadFile
);

router.post("/bulkuploaduserdummy",bulkUploadUserDummy)
router.get("/getallusers",getAllUsers)
export default router;