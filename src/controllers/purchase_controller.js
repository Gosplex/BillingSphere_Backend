const PurchaseModel = require("../models/purchase_model");
const Items = require("../models/items_model");
const Ledger = require("../models/ledger_model");

const PurchaseController = {
  // For creating purchase entry
  createPurchase: async function (req, res) {
    try {
      const purchaseData = req.body;
      purchaseData.totalamount = parseFloat(purchaseData.totalamount);
      purchaseData.cashAmount = parseFloat(purchaseData.cashAmount);
      purchaseData.dueAmount = parseFloat(purchaseData.dueAmount);
      const newPurchaseData = PurchaseModel(purchaseData);

      // Extract Data
      const ledgerID = purchaseData.ledger;
      const purchaseType = purchaseData.type;

      if (purchaseType === "Debit") {
        const ledger = await Ledger.findById(ledgerID);

        if (ledger.openingBalance < purchaseData.totalamount) {
          const remainingAmount =
            purchaseData.totalamount - ledger.openingBalance;
          purchaseData.dueAmount = remainingAmount;
          ledger.openingBalance = 0;
          newPurchaseData.dueAmount = purchaseData.dueAmount;
        } else if (ledger.openingBalance >= purchaseData.totalamount) {
          ledger.openingBalance -= purchaseData.totalamount;
        }
        await ledger.save();
      }

      if (purchaseType === "Cash") {
        if (purchaseData.cashAmount < purchaseData.totalamount) {
          purchaseData.dueAmount =
            purchaseData.totalamount - purchaseData.cashAmount;

          newPurchaseData.dueAmount = purchaseData.dueAmount;
        } else {
          purchaseData.dueAmount = 0;
          newPurchaseData.dueAmount = purchaseData.dueAmount;
        }
      }

      const existingPurchase = await PurchaseModel.findOne({
        $or: [
          { billNumber: req.body.billNumber },
        ],
      });

      if (existingPurchase) {
        return res.json({
          success: false,
          message: "Bill No already exists.",
        });
      }

      await newPurchaseData.save();

      for (const entry of purchaseData.entries) {
        const productId = entry.itemName;
        const quantity = entry.qty;
        const sellingPrice = entry.sellingPrice;

        const product = await Items.findById(productId);

        if (!product) {
          return res.json({
            success: false,
            message: "Product not found.",
          });
        }

        // Update maximum stock
        product.maximumStock += quantity;
        product.price = sellingPrice;
        await product.save();
      }

      return res.json({
        success: true,
        message: "Purchase entry created successfully!",
        data: newPurchaseData,
      });
    } catch (ex) {
      return res.json({ success: false, message: ex });
    }
  },

  //For Fetching all Purchase

  fetchAllPurchase: async function (req, res) {
    try {
      const { user_id } = req.params;
      const fetchAllPurchase = await PurchaseModel.find({ user_id: user_id});
      return res.json({ success: true, data: fetchAllPurchase });
    } catch (ex) {
      return res.json({ success: false, message: ex });
    }
  },

  //For Fetching purchase by id
  fetchPurchseById: async function (req, res) {
    try {
      const id = req.params.id;
      const foundPurchaseById = await PurchaseModel.findById(id);
      if (!foundPurchaseById) {
        return res.json({
          success: false,
          message: "Purchase entry not found.",
        });
      }
      return res.json({ success: true, data: foundPurchaseById });
    } catch (ex) {
      res.json({ success: false, message: ex });
    }
  },
  //For Deleting Purchase Entry

  deletePurchaseById: async function (req, res) {
    try {
      const id = req.params.id;
      
      // find purchase entry by id
      const getPurchase = await PurchaseModel.findOne({ id });
      // Iterate over the entries of the purchase
      for (const entry of getPurchase.entries) {
        const productId = entry.itemName;
        const quantity = entry.qty;
        const product = await Items.findById(productId);
        // Update maximum stock
        product.maximumStock -= quantity;
        await product.save();
      }
      const getPurchaseAndDelete = await PurchaseModel.deleteOne({ id });
      if (!getPurchaseAndDelete) {
        return res.json({ success: false, message: "Purchase not found" });
      }
      return res.json({ success: true, message: "Deleted Successfully!" });
    } catch (ex) {
      return res.json({ success: false, message: ex });
    }
  },
};

module.exports = PurchaseController;
