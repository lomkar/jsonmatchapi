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
  subRouter.get("/", async (req, res) => {
    PublicJsonData.findById(publicIdObject)
      .then((results: any) => {
        return res.status(200).json(results.jsonData);
      })
      .catch((error: any) => {
        return res.status(400).json(error);
      });
  });
  subRouter.get("/:id", async (req, res) => {
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

  subRouter.put("/:id", async (req, res) => {
    const updateFields = req.body; // Assuming the request body contains the updated fields

    delete updateFields.id;
    let updateObject: any = {};

    const existingData = await PublicJsonData.aggregate([
      { $match: { _id: publicIdObject } },
      { $unwind: "$jsondata" },
      { $match: { "jsondata.id": req.params.id } },
      { $replaceRoot: { newRoot: "$jsondata" } },
    ]);

    if (existingData.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    // Update only the specified fields from req.body
    const newData = { ...existingData[0], ...req.body };

    // Update the document with the modified jsondata
    PublicJsonData.updateOne(
      { _id: publicIdObject, [`jsondata.id`]: req.params.id },
      { $set: { [`jsondata.$`]: newData } }
    )
      .then((results: any) => {
        console.log(results);
        return res.status(200).json(results);
      })
      .catch((error: any) => {
        console.log(error);
        return res.status(400).json(error);
      });
  });

  return subRouter;
};

export const generateRoutes = (
  resource: string,
  publicId: string,
  resourcetype: any
) => {
  const subRouter = express.Router();

  let publicIdObject = new ObjectId(publicId);
  // if (Array.isArray(resourcetype)) {
  if (resourcetype === "array") {
    subRouter.get("/", async (req, res) => {
      // const resource = 'user'; // Assuming resource is set to 'user'

      PublicJsonData.aggregate([
        { $unwind: `$jsondata.${resource}` },
        { $replaceRoot: { newRoot: `$jsondata.${resource}` } },
      ])
        .then((results: any) => {
          if (results.length > 0) {
            return res.json(results);
          }
          return res.json(null);
        })
        .catch((error: any) => console.error(error));
    });
    console.log("COMMING1")

    subRouter.get("/:id", async (req, res) => {
      console.log("COMMING2") 
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
          return res.status(400).json({
            success:false,
            message:"No data found"
          });
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

    subRouter.put("/:id", async (req, res) => {
      const updateFields = req.body; // Assuming the request body contains the updated fields

      delete updateFields.id;

      const existingData = await PublicJsonData.aggregate([
        { $match: { _id: publicIdObject } },
        { $unwind: `$jsondata.${resource}` },
        { $match: { [`jsondata.${resource}.id`]: req.params.id } },
        { $replaceRoot: { newRoot: `$jsondata.${resource}` } },
      ]);

      console.log("Existing data =>", existingData);
      if (existingData.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }

      // Update only the specified fields from req.body
      const newData = { ...existingData[0], ...req.body };

      console.log("NEW DATA => ", newData);

      // Update the document with the modified jsondata
      PublicJsonData.updateOne(
        { _id: publicIdObject, [`jsondata.${resource}.id`]: req.params.id },
        { $set: { [`jsondata.${resource}.$`]: newData } }
      )
        .then((results: any) => {
          console.log(results);
          return res.status(200).json(results);
        })
        .catch((error: any) => {
          console.log(error);
          return res.status(400).json(error);
        });
    });
  } else if (resourcetype === "object") {
    subRouter.get("/", async (req: Request, res: Response) => {
      try {
        PublicJsonData.findById(publicIdObject)
          .then((results: any) => {
            return res.status(200).json(results.jsonData);
          })
          .catch((error: any) => {
            return res.status(400).json(error);
          });
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
    let publicIdObject = new ObjectId(publicid);

    const publicJSONData = await PublicJsonData.findById(publicid).select(
      "id routetype routeslist"
    );
    if (!publicJSONData) {
      return res.status(400).json({
        message: "No data found",
        success: false,
      });
    }
    // if (publicJSONData && publicJSONData.jsondata) {
    router.get("/", async (req, res) => {
      try {
        const publicJSONData = await PublicJsonData.findById(publicid);
        return res.json(publicJSONData.jsondata);
      } catch (error: any) {
        console.log("Error in get Object route ", error);
        return res.status(400).json({
          APIERROR: "Error Getting document ",
          message: error.message,
        });
      }
    });

    router.put("/", async (req, res) => {
      try {
        const dataBody = req.body;
        // Find the document by ID and update it
        const dataResult = await PublicJsonData.findById(publicid);

        // Check if the document was found and updated
        if (dataResult) {
          let newUpdatedData = { ...dataResult.jsondata, ...dataBody };
          const updatedDocument = await PublicJsonData.findOneAndUpdate(
            { _id: publicIdObject },
            { $set: { jsondata: newUpdatedData } },
            { new: true } // Return the updated document
          );
          return res.status(200).json({
            updatedDocument,
          });
        } else {
          console.log("Document not found");
          return res.status(400).json("Document not found");
        }
      } catch (error: any) {
        console.error("Error updating document:", error.message);
        return res.status(400).json({
          APIERROR: "Error updating document ",
          message: error.message,
        });
      }
    });

    // if (Array.isArray(publicJSONData.jsondata)) {
    if (publicJSONData.routetype === "array") {
      router.use(generateRoutesForArray(publicid));
      // } else if (typeof publicJSONData.jsondata === "object") {
    } else if (publicJSONData.routetype === "object") {
      // const jsondata = publicJSONData.jsondata as JsonDataWithId;

      // Create an array to hold all the sub-routers
      // const resourceRouters = Object.keys(jsondata).map((resource) => {
      //   const resourceData = jsondata[resource];

      console.log("JSON DA|TA ", publicJSONData);
      // return res.json({ routesList: publicJSONData["routeslist"] });
      const resourceRouters = publicJSONData.routeslist.map((route: any) => {
        let resource = route.routes;
        let resourcetype = route.dataType;
        return generateRoutes(resource, publicid, resourcetype);
      });
      // });

      // Combine the sub-routers into the main router
      // resourceRouters.forEach((resourceRouter:any, index:number) => {
      //   router.use(`/${Object.keys(jsondata)[index]}`, resourceRouter);
      // });

      resourceRouters.forEach((resourceRouter: any, index: number) => {
        let resource = publicJSONData.routeslist[index].routes;
        console.log("Resource => ", resource);
        router.use(`/${resource}`, resourceRouter);
      });
    }
    // }

    router(req, res, next); // Call the main router to handle the request
  } catch (err: any) {
    console.log("Err in getPublicJsonRoute API: ", err);
    throw new InfoError(err);
  }
};
export default getPublicJsonRoute;
