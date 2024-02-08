"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const router = express.Router();
const { apiUrl } = require("../config");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
router.post("/public", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("REQ BODY ", req.body);
        const { jsonData } = req.body;
        const result = yield prisma.publicJsonData.create({
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Something went wrong",
        });
    }
}));
router.get("/public/:publicid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const publicid = req.params.publicid;
        const result = yield prisma.publicJsonData.findUnique({
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Something went wrong",
        });
    }
}));
module.exports = router;
