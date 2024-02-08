import express, { NextFunction, Request, Response } from "express";
import { GetPublicRequest } from "../controllers/public.controller";
import InfoError from "../errors/InfoError";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { generateUniqueIdToJson } from "../helpers/public.helper";
const prisma = new PrismaClient();

router.get("/getall", async (req, res) => {
  try {
    const data = await prisma.publicJsonData.findMany({
    })
  } catch (err: any) {
    console.log("Error in getAll", err);
    throw new InfoError(err);
  }
});

router.get("/getall/:id", async (req, res) => {
    try {
        const id = req.params.id
      const data = await prisma.publicJsonData.findFirst({
        where:{
            data:{
               equals:{
                id:id
               }
            }
        },
        select:{
            JsonData:{
            where:{
                id:id
            },
            }
        }
      })
    } catch (err: any) {
      console.log("Error in getAll", err);
      throw new InfoError(err);
    }
  });
