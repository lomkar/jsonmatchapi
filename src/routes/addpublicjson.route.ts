import express, { NextFunction, Request, Response } from "express";
import { generateUniqueIdToJson } from "../helpers/public.helper";
import InfoError from "../errors/InfoError";
import { JsonDataWithId, generateRoutes } from "./index.route";
const PublicJsonData = require("../models/publicjsondata");
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    let newData = req.body;
    newData = generateUniqueIdToJson(newData);

    const document = new PublicJsonData({
      jsondata: newData,
    });
    const result = await document.save();
  
    let routesList: any = [];
    let routeType = "array";
    if (Array.isArray(result.jsondata)) {
      routeType = "array";
    } else if (typeof result.jsondata === "object") {
      const jsondata = result.jsondata as JsonDataWithId;

      Object.keys(jsondata).forEach((resource, index) => {
        routeType = "object";
        let routes = Object.keys(jsondata)[index];
        let dataType = "string";

        if (Array.isArray(jsondata[routes])) {
          dataType = "array";
        } else if (typeof jsondata[routes] === "object") {
          dataType = "object";
        } else if (typeof jsondata[routes] === "string") {
          dataType = "string";
        } else if (typeof jsondata[routes] === "number") {
          dataType = "number";
        }
        routesList.push({ routes, dataType });
      });
    }

    const updatedDocument = await PublicJsonData.findByIdAndUpdate(
      result._id,
      {
        routetype:routeType,
        routeslist:routesList
      }, // req.body should contain the updated data
      { new: true, runValidators: true } // options: new returns the modified document, runValidators ensures validation is applied
    );
    return res.json({
      success: true,
      data: {
        publicId: result._id,
        result: result.jsondata,
        routeslist: routesList,
      },
    });
    /////////////////////

    // })
    // .catch((error: any) => {
    //   console.log(error);
    //   throw new InfoError(error);
    // });
  } catch (err: any) {
    console.log(err);
    throw new InfoError(err);
  }
});

export default router;
