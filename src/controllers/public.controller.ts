import express, { Request, Response } from "express";

import InfoError from "../errors/InfoError";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { JsonDataWithId } from "../helpers/public.helper";
const prisma = new PrismaClient();

export const GetPublicRequest = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    let publicJSONData = (await prisma.publicJsonData.findFirst({
      where: {
        id: publicId,
      },
      select: {
        JsonData: true,
      },
    })) as { data: JsonDataWithId } | null;

    if (!publicJSONData) {
      throw new InfoError("No json found.");
    }

    return res.json({
      success: true,
      data: publicJSONData.data,
    });
  } catch (err: any) {
    console.log("Error in GetPublicRequest => ", err);
    throw new InfoError(err);
  }
};

export const PostPublicRequest = async (req: Request, res: Response) => {
  try {
    
  } catch (err: any) {
    console.log("Error in PostPublicRequest => ", err);
    throw new InfoError(err);
  }
};


