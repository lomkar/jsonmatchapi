const express = require("express");
const router = express.Router();

const { apiUrl } = require("../config");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
router.post("/public", async (req, res) => {
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
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
});

router.get("/public/:publicid", async (req, res) => {
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
module.exports = router;
