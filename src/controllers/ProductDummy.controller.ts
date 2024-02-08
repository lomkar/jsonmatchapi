import express, { Request, Response } from "express";

import { PrismaClient } from "@prisma/client";
import InfoError from "../errors/InfoError";
import moment from "moment";
const short = require("short-uuid");
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const fs = require("fs");
const prisma = new PrismaClient();

export const uploadFileProduct = async (req: any, res: Response) => {
  try {
    if (!req?.file) {
      throw new InfoError("please upload a file");
    }

    let data = {
      url: "",
      type: "",
      filename: "",
    };

    if (!!req?.file) {
      data = {
        url: req.file?.location,
        type: req.file.mimetype,
        filename: req.file.key,
      };
    }

    return res.status(201).json({
      uploaded: true,
      success: true,
      message: "File uploaded successfully",
      data: data,
    });
  } catch (error: any) {
    console.log("Error  uploadFile API", error);
    throw new InfoError(error);
  }
};

export const addProductDummy = async (product: any) => {
  //   const { user } = req.body;

  const PAT = "6182277373794da983af190720e4574d";

  const USER_ID = "openai";
  const APP_ID = "dall-e";

  const MODEL_ID = "dall-e-3";
  const MODEL_VERSION_ID = "dc9dcb6ee67543cebc0b9a025861b868";
  const RAW_TEXT = `create a product image of ${product.title} in hyper realistic`;

  const stub = ClarifaiStub.grpc();

  const metadata = new grpc.Metadata();
  metadata.set("authorization", "Key " + PAT);

  console.log("Started creating Image via DAll-e");
  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      model_id: MODEL_ID,
      version_id: MODEL_VERSION_ID,
      inputs: [
        {
          data: {
            text: {
              raw: RAW_TEXT,
            },
          },
        },
      ],
    },
    metadata,
    async (err: any, response: any) => {
      if (err) {
        throw new Error(err);
      }

      if (response.status.code !== 10000) {
        throw new Error(
          "Post models failed, status: " + response.status.description
        );
      }

      const output = response.outputs[0].data.image.base64;

      console.log("Start saving to aws s3");
      const url = await saveImageAPI(output);

      if (url) {
        let photolurl = [];
        photolurl.push(url);
        console.log("Saving to database");
        try {
        
          const newProduct = await prisma.productDummy.create({
            data: {
              category: product.category,
              description: product.description,
              images: photolurl,
              price: product.price,
              title: product.title,
              rating: {
                create: {
                  count: product.rating.count,
                  rate: product.rating.rate,
                },
              },
            },
          });

          //   return res.json({
          //     status: true,
          //     data: newUser,
          //   });
          return newProduct;
        } catch (error: any) {
          console.log(error);
        }
      }
    }
  );
};

const axios = require("axios");

async function saveImageAPI(output: any) {
  try {
    const formData = new FormData();
    const blob = new Blob([output], { type: "image/png" });

    formData.append("file", blob, "image.png");
    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    };

    const result = await axios.post(
      "http://localhost:3001/api/product/uploadfile",
      formData,
      config
    );

    const url = result.data.data.url;

    return url;
  } catch (err: any) {
    console.log(err);
    return null;
  }
}

export const bulkUploadProductDummy = async (req: any, res: Response) => {
  try {
    let newUsersArray = [];
    let { products } = req.body;
    for (let i = 0; i < products.length; i++) {
      console.log("Started product => ", products[i].title);
      let newUser = await addProductDummy(products[i]);
      newUsersArray.push(newUser);
    }
    return res.status(201).json({
      success: true,
      data: newUsersArray,
    });
  } catch (error: any) {
    console.log(error);
  }
};

export const getAllProducts = async (req: any, res: Response) => {
  const products = await prisma.productDummy.findMany()
  res.json({ products });
};
