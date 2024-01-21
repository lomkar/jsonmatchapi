require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var morgan = require("morgan");
const app = express();
const { PrismaClient } = require("@prisma/client");

const routes = require("./routes/index");

// app.use(morgan("dev"));

const port = process.env.PORT || 3001;

//My Routes
// Define CORS options
// const corsOptions = {
//   origin: "http://example.com", // or an array of allowed origins
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true, // enable cookies from the client
//   optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// Enable CORS with specific options
// app.use(cors(corsOptions));
app.use(cors({ origin: "*" }));

// app.use((req, res, next) => {
//   console.log("Request received:", req.method, req.url);
//   res.on("finish", () => {
//     console.log("Response sent:", res.statusCode);
//   });
//   next();
// });
app.get("/api", (req, res) => {
  return res.json({
    success: true,
    message: "API is working",
  });
});

app.use("/api", routes);
app.use(bodyParser.json());

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
