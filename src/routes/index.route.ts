import express, { NextFunction, Request, Response } from "express";
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
import InfoError from "../errors/InfoError";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { generateIdForObject } from "../helpers/public.helper";
const prisma = new PrismaClient();
const PublicJsonData = require("../models/publicjsondata");
interface JsonValue {
  [key: string]: JsonValue | JsonValue[] | string | number | boolean | null;
}

export interface JsonDataWithId {
  id: string;
  [key: string]:
    | JsonValue
    | JsonDataWithId
    | JsonDataWithId[]
    | string
    | number
    | boolean
    | null;
}

const generateRoutesForArray = (publicId: string) => {
  let publicIdObject = new ObjectId(publicId);
  const subRouter = express.Router();

  subRouter.get("/:id", async (req, res) => {
    console.log("HEELO");
    PublicJsonData.aggregate([
      { $match: { _id: publicIdObject } },
      { $unwind: "$jsondata" },
      { $match: { "jsondata.id": req.params.id } },
      { $replaceRoot: { newRoot: "$jsondata" } },
    ])
      .then((results: any) => {
        if (results.length > 0) {
          return res.json(results[0]);
        }
        return res.json(null);
      })
      .catch((error: any) => console.error(error));
  });

  subRouter.post("/", (req, res) => {
    let newData = generateIdForObject(req.body);
    PublicJsonData.updateOne(
      { _id: publicIdObject },
      { $push: { jsondata: newData } }
    )
      .then((results: any) => {
        return res.json(results);
      })
      .catch((error: any) => console.error(error));
  });

  subRouter.put("/:id", (req, res) => {
    const updateFields = req.body; // Assuming the request body contains the updated fields

    delete updateFields.id;
    let updateObject: any = {};
    for (let key in updateFields) {
      updateObject[`jsondata.$.${key}`] = updateFields[key];
    }

    PublicJsonData.updateOne(
      { _id: publicIdObject, "jsondata.$.id": req.params.id },
      { $set: updateObject }
    )
      .then((result: any) => {
        // Check result and handle accordingly
        console.log(result);
        return res.json(result);
      })
      .catch((error: any) => {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

  return subRouter;
};

const generateRoutes = (
  resource: string,
  publicId: string,
  resourceData: any
) => {
  const subRouter = express.Router();

  if (Array.isArray(resourceData)) {
    let publicIdObject = new ObjectId(publicId);
    console.log("Comming")
    

    subRouter.get("/:id", async (req, res) => {
      console.log("HEELO");
      PublicJsonData.aggregate([
        { $match: { _id: publicIdObject } },
        { $unwind: `$jsondata.${resource}` },
        { $match: { [`jsondata.${resource}.id`]: req.params.id } },
        { $replaceRoot: { newRoot: `$jsondata.${resource}` } },
      ])
        .then((results: any) => {
          if (results.length > 0) {
            return res.json(results[0]);
          }
          return res.json(null);
        })
        .catch((error: any) => console.error(error));
    });

    subRouter.post("/", (req, res) => {
      let newData = generateIdForObject(req.body);
      PublicJsonData.updateOne(
        { _id: publicIdObject },
        { $push: { [`jsondata.${resource}`]: newData } }
      )
        .then((results: any) => {
          return res.json(results);
        })
        .catch((error: any) => console.error(error));
    });

    subRouter.put("/:id", (req, res) => {
      const updateFields = req.body; // Assuming the request body contains the updated fields

      delete updateFields.id;
      let updateObject: any = {};
      for (let key in updateFields) {
        updateObject[`jsondata.${resource}.$.${key}`] = updateFields[key];
      }

      console.log("updateObject",updateObject)

      PublicJsonData.updateOne(
        { _id: publicIdObject, [`jsondata.${resource}.$.id`]: req.params.id },
        { $set: updateObject }
      )
        .then((result: any) => {
          // Check result and handle accordingly
          console.log(result);
          return res.json(result);
        })
        .catch((error: any) => {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
        });
    });
  } else if (typeof resourceData === "object") {
    subRouter.get("/", async (req: Request, res: Response) => {
      try {
        /*
        const publicid = req.params.publicid;
        const dataResult = await prisma.publicJsonData.findFirst({
          where: {
            id: publicid,
          },
          select: {
            id: true,
            JsonData: true,
          },
        });

        if (!dataResult) {
          throw new InfoError("No Data found");
        }

        if (dataResult.JsonData && typeof dataResult.JsonData === "object") {
          const jsonData = dataResult.JsonData as
            | JsonDataWithId
            | JsonDataWithId;

          if (typeof jsonData[resource] !== "undefined") {
            return res.json({
              success: true,
              publicid: dataResult.id,
              data: jsonData[resource],
            });
          } else {
            return res.json({
              success: false,
              data: null,
              error: `Property '${resource}' not found in JsonData.`,
            });
          }
        } else {
          return res.json({
            success: false,
            data: null,
            error: "JsonData is null or not an object.",
          });
        }
        */
      } catch (error: any) {
        console.error(error);
        throw new InfoError(error);
      }
    });

    subRouter.put(`/`, async (req: Request, res: Response) => {
      // const updatedData = req.body;
      // Object.assign(resourceData, updatedData);
      // res.json(resourceData);

      // const resourceId = parseInt(req.params.id);
      const updatedData = req.body;
      const publicid = req.params.publicid;
      const dataResult = await prisma.publicJsonData.findFirst({
        where: {
          id: publicid,
        },
        select: {
          JsonData: true,
        },
      });

      if (!dataResult) {
        throw new InfoError("No Data found");
      }

      try {
        const updatedResource = await prisma.publicJsonData.update({
          where: { id: publicid },
          data: { JsonData: { ...updatedData } },
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
      } catch (error: any) {
        console.error(error);
        throw new InfoError(error);
      }
    });
    subRouter.patch(`/`, async (req: Request, res: Response) => {
      // const updatedProps = req.body;
      // Object.assign(resourceData, updatedProps);
      // res.json(resourceData);

      const publicid = req.params.publicid;
      const updatedFields = req.body;
      const dataResult = await prisma.publicJsonData.findFirst({
        where: {
          id: publicid,
        },
        select: {
          JsonData: true,
        },
      });

      if (!dataResult) {
        throw new InfoError("No Data found");
      }
      try {
        const updatedResource = await prisma.publicJsonData.update({
          where: { id: publicid },
          data: {
            JsonData: { ...updatedFields },
          },
          select: { JsonData: true, id: true },
        });
        return res.json({
          success: true,
          publicid: updatedResource.id,
          data: updatedResource.JsonData,
        });
      } catch (error: any) {
        console.error(error);
        throw new InfoError(error);
      }
    });
  }

  return subRouter; // Return the sub-router
};

const getPublicJsonRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicid } = req.params;

    const publicJSONData = await PublicJsonData.findById(publicid);

    if (publicJSONData && publicJSONData.jsondata) {
      router.get("/", (req, res) => {
        return res.json(publicJSONData.jsondata);
      });

      if (Array.isArray(publicJSONData.jsondata)) {
        router.use(generateRoutesForArray(publicid));
      } else if (typeof publicJSONData.jsondata === "object") {
        const jsondata = publicJSONData.jsondata as JsonDataWithId;

        // Create an array to hold all the sub-routers
        const resourceRouters = Object.keys(jsondata).map((resource) => {
          const resourceData = jsondata[resource];

          return generateRoutes(resource, publicid, resourceData);
        });

        // Combine the sub-routers into the main router
        resourceRouters.forEach((resourceRouter, index) => {
          router.use(`/${Object.keys(jsondata)[index]}`, resourceRouter);
        });
      }
    }

    // Respond with the main JSON data
    // res.json(jsonData);

    router(req, res, next); // Call the main router to handle the request
  } catch (err: any) {
    console.log("Err in getPublicJsonRoute API: ", err);
    throw new InfoError(err);
  }
};
export default getPublicJsonRoute;
