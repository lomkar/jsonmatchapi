require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var morgan = require("morgan");
const app = express();
const { PrismaClient } = require("@prisma/client");
const { apiUrl, webappUrl } = require("./config");
const prisma = new PrismaClient();
app.use(cors())
app.use(bodyParser.json());

app.use(morgan("dev"));

const port = process.env.PORT || 3001;

//My Routes


app.get("/api",(req,res)=>{
  return res.json({
    success:true,
    message:"API is working"
  })
})
app.post("/api/public", async (req, res) => {
  try {
    const { jsonData } = req.body;
    const result = await prisma.publicJsonData.create({
      data: {
        JsonData: jsonData,
      },
      select: {
        id: true,
        JsonData: true,
      },
    });

    return res.status(201).json({
      message: "User created Successfully",
      success: true,
      url: `${apiUrl}/api/public/${result.id}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
});

app.get("/api/public/:publicid", async (req, res) => {
  try {
    const publicid = req.params.publicid;
    const result = await prisma.publicJsonData.findUnique({
      where: {
        id: publicid,
      },
      select: {
        JsonData: true,
      },
    });

    if (!result) {
      return res.status(500).json({ error: "No json found." });
    }

    return res.status(200).json(result.JsonData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
});

//catch 404 errors and forwared then to error handler
app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

//Error handler function
app.use((err, req, res, next) => {
  const error = app.get("env") === "development" ? err : {};
  const status = err.status || 500;

  //respond to client
  res.status(status).json({
    error: error.message,
  });

  //respond the ourselves
  console.error(err);
});

app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
