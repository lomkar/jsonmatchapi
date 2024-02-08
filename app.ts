import cookieParser from "cookie-parser";

import express, { Request, Response } from "express";
require("express-async-errors");
const mongoose = require("mongoose");

const app = express();
import { PrismaClient } from "@prisma/client";
// import examRoute from "./src/routes/exam.route";
import addPublicJsonRoute from './src/routes/addpublicjson.route'
import userdummyRoute from "./src/routes/UserDummy.route";
import productdummyRoute from "./src/routes/ProductDummy.route";
import globalErrorHandler from "./src/middleware/globalErrorHandlers";
import indexRoute  from './src/routes/index.route'

const prisma = new PrismaClient();

import cors from "cors";

mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGODB_DATABASE_URL)
  .then(() => {
    console.log("DB CONNECTED");
  });

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use(cookieParser());
app.get("/api", (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "API is working",
  });
});

// app.use("/api/auth", authRoute);
// app.use("/api/file", fileRoute);
// app.use("/api/androidversion", androidversionRoute);
// app.use("/api/folder", folderRoute);
app.use("/api/public", addPublicJsonRoute);
app.use("/api/public/:publicid",indexRoute)
app.use("/api/user", userdummyRoute);
app.use("/api/product", productdummyRoute);
app.post("/api/delete", async (req: any, res: any) => {
  try {
    await prisma.ratingProductDummy.deleteMany({});
    await prisma.productDummy.deleteMany({});
  } catch (err) {
    console.log(err);
  }
});
app.use("*", globalErrorHandler);

app.listen(3001, () => {
  console.log(`Server running on port ${3001}`);
});
