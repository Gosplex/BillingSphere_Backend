const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  no: {
    type: Number,
    required: true,
  },
  totalamount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  entries: [
    {
      account: {
        type: String,
        required: true,
      },
      ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
      remark: {
        type: String,
        required: false,
      },
      debit: {
        type: Number,
        required: false,
      },
      credit: {
        type: Number,
        required: false,
      },
    },
  ],
  billwise: [
    {
      date: {
        type: String,
        required: true,
      },
      purchase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase",
        required: true,
      },
      billNo: {
        type: String,
        required: false,
      },
      amount: {
        type: Number,
        required: false,
      },
    },
  ],
  narration: {
    type: String,
    required: false,
  },
  companyCode: {
    type: String,
    ref: "NewCompany",
    required: true,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
