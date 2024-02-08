import express, { NextFunction, Request, Response } from "express";
import { generateUniqueIdToJson } from "../helpers/public.helper";
import InfoError from "../errors/InfoError";
const PublicJsonData = require("../models/publicjsondata");
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    let newData = req.body;
    newData = generateUniqueIdToJson(newData);

    const document = new PublicJsonData({
      jsondata: newData,
    });
    await document
      .save()
      .then((savedDocument: any) => {
        return res.json({
          success: true,
          data: {
            publicId: savedDocument.id,
            output: savedDocument.jsondata,
          },
        });
      })
      .catch((error: any) => {
        console.log(error);
        throw new InfoError(error);
      });
  } catch (err: any) {
    console.log(err);
    throw new InfoError(err);
  }
});

export default router;
