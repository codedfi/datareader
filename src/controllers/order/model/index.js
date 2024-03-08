const mongoose = require("../../../plugins/mongodb");
const options = {
  versionKey: false,
};
const Schema = mongoose.Schema;
const Order = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      dropDups: true,
    },
    startTime: Number,
    channel: String,
    sender: String,
    retryTime: Number,
    commonOrder: {
      sourceCerts: [
        {
          fromAmount: String,
          fromIndex: String,
          fromChain: String,
          fromAddr: String,
          certHash: String,
          fromPublicKey: {
            type: String,
            default: ''
          },
          signature: String
        }
      ],
      orderType: Number,
      toIndex: String,
      slippage: Number,
      triggerPrice: String,
      timeout: Number,
      toChain: String,
      toAddr: String,
      execStrategy: {
        type: String,
        default: ''
      },
      extra: {
        type: String,
        default: ''
      },
    },
    orderStatus: {
      status: String,
      timestamp: Number,
      amountOut: String,
      execHash: {
        type: String,
        default: ''
      },
      reason: {
        type: String,
        default: ''
      },
    },
    syncStatus: String,
    suborder: {
      dependsOn : String,
      suborders : [String]
    },
    fee: String
  },
  options
);

Order.index({ id: 1 });
module.exports = mongoose.model("order", Order, "order");
