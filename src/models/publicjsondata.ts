const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PublicJsonData = new Schema(
  {
    routetype: {
      type: String,
      default: "object",
      required: false,
    },
    routeslist: Schema.Types.Mixed,
    jsondata: Schema.Types.Mixed,
    requestcount: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("publicjsondata", PublicJsonData);
