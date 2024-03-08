const mongoose = require("../../../plugins/mongodb");
const options = {
  versionKey: false,
};
const Schema = mongoose.Schema;
const CmcPrice = new Schema(
  {
    cmcid: Number,
    name: String,
    price: String,
    source: String,
    symbol: String
  },
  options
);

CmcPrice.index({ id: 1 });
module.exports = mongoose.model("cmcprice", CmcPrice, "cmcprice");
