"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PublicJsonData = new Schema({
    JsonData: Schema.Types.Mixed,
    requestCount: {
        type: Number,
        required: false,
        default: 0,
    },
}, {
    timestamps: true,
});
module.exports = mongoose.model("publicjsondata", PublicJsonData);
