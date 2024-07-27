const DeliveryChallanModel = require("../models/delivery_challan_model");
const ProductStockModel = require("../models/product_stock_model");
const ItemModel = require("../models/items_model");
const PurchaseModel = require("../models/purchase_model");

// // For creating a new inward challan
// const createDeliveryChallan = async (req, res) => {
//   try {
//     const deliveryChallan = new DeliveryChallanModel(req.body);
//     for (let entry of req.body.entries) {
//       const item = await ItemModel.findById(entry.itemName);
//       console.log('REQ BODY:', req.body.entries);
//       console.log(req.body.companyCode);
//       await item.updateOne(
//         { _id: item._id },
//         { $inc: { maximumStock: -entry.qty } }
//       );
//       console.log(`Decremented maximumStock by ${entry.qty} for item ${item._id}`);
//       const existingItem = await ItemModel.findOne({
//         codeNo: item.codeNo,
//         companyCode: req.body.companyCode,
//       });
//       console.log('Found E item id:', existingItem._id);
//       if (existingItem) {
//         await existingItem.updateOne(
//           { _id: existingItem._id },
//           { $inc: { maximumStock: 200 } }
//         );
//         console.log(`Incremented maximumStock by ${entry.qty} for item ${existingItem._id}`);
//       } else {
//         const newItem = new ItemModel({
//           itemGroup: item.itemGroup,
//           itemBrand: item.itemBrand,
//           itemName: item.itemName,
//           printName: item.printName,
//           codeNo: item.codeNo,
//           taxCategory: item.taxCategory,
//           hsnCode: item.hsnCode,
//           barcode: item.barcode,
//           storeLocation: item.storeLocation,
//           measurementUnit: item.measurementUnit,
//           secondaryUnit: item.secondaryUnit,
//           minimumStock: item.minimumStock,
//           maximumStock: entry.qty,
//           monthlySalesQty: item.monthlySalesQty,
//           date: item.date,
//           dealer: item.dealer,
//           subDealer: item.subDealer,
//           retail: item.retail,
//           mrp: item.mrp,
//           price: item.price,
//           openingStock: item.openingStock,
//           status: item.status,
//           images: item.images,
//           createdAt: Date.now(),
//           updatedAt: Date.now(),
//           companyCode: req.body.companyCode,
//         });
//         console.log("New Item");
//         console.log(newItem);
//         // Save the new item
//         await newItem.save();
//       }
//     }
//     // Save the delivery challan
//     await deliveryChallan.save();
//     res.status(201).send(deliveryChallan);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

// const createDeliveryChallan = async (req, res) => {
//   try {
//     const deliveryChallan = new DeliveryChallanModel(req.body);

//     const updatePromises = req.body.entries.map(async (entry) => {
//       const item = await ItemModel.findById(entry.itemName);

//       item.maximumStock -= entry.qty;
//       item.save();
//       console.log(`Decremented maximumStock by ${entry.qty} for item ${item._id}`);
//       const existingItem = await ItemModel.findOne({
//         codeNo: item.codeNo,
//         companyCode: req.body.companyCode,
//       });

//       if (existingItem) {

//         existingItem.maximumStock += entry.qty;
//         await existingItem.save();
//       } else {
//         const newItem = new ItemModel({
//           itemGroup: item.itemGroup,
//           itemBrand: item.itemBrand,
//           itemName: item.itemName,
//           printName: item.printName,
//           codeNo: item.codeNo,
//           taxCategory: item.taxCategory,
//           hsnCode: item.hsnCode,
//           barcode: item.barcode,
//           storeLocation: item.storeLocation,
//           measurementUnit: item.measurementUnit,
//           secondaryUnit: item.secondaryUnit,
//           minimumStock: item.minimumStock,
//           maximumStock: entry.qty,
//           monthlySalesQty: item.monthlySalesQty,
//           date: item.date,
//           dealer: item.dealer,
//           subDealer: item.subDealer,
//           retail: item.retail,
//           mrp: item.mrp,
//           price: item.price,
//           openingStock: item.openingStock,
//           status: item.status,
//           images: item.images,
//           createdAt: Date.now(),
//           updatedAt: Date.now(),
//           companyCode: req.body.companyCode,
//         });

//         console.log("New Item");
//         console.log(newItem);

//         await newItem.save();
//       }



//     });

//     await Promise.all(updatePromises);

//     await deliveryChallan.save();
//     res.status(201).send(deliveryChallan);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

const createDeliveryChallan = async (req, res) => {
  try {
    // Create a new delivery challan instance from the request body
    const deliveryChallan = new DeliveryChallanModel(req.body);

    // Process each entry in the request body to update stock and track item IDs
    const updatePromises = req.body.entries.map(async (entry) => {
      // Find the item in the current store by its ID
      const item = await ItemModel.findById(entry.itemName);

      // Decrement the stock of the item in the current store
      item.maximumStock -= entry.qty;
      await item.save();
      console.log(`Decremented maximumStock by ${entry.qty} for item ${item._id}`);

      // Check if the item exists in the target store
      let existingItem = await ItemModel.findOne({
        codeNo: item.codeNo,
        companyCode: req.body.companyCode,
      });

      let itemId;
      if (existingItem) {
        // If the item exists in the target store, update its stock
        existingItem.maximumStock += entry.qty;
        await existingItem.save();
        itemId = existingItem._id;
      } else {
        // If the item does not exist in the target store, create a new item
        const newItem = new ItemModel({
          itemGroup: item.itemGroup,
          itemBrand: item.itemBrand,
          itemName: item.itemName,
          printName: item.printName,
          codeNo: item.codeNo,
          taxCategory: item.taxCategory,
          hsnCode: item.hsnCode,
          barcode: item.barcode,
          storeLocation: item.storeLocation,
          measurementUnit: item.measurementUnit,
          secondaryUnit: item.secondaryUnit,
          minimumStock: item.minimumStock,
          maximumStock: entry.qty,
          monthlySalesQty: item.monthlySalesQty,
          date: item.date,
          dealer: item.dealer,
          subDealer: item.subDealer,
          retail: item.retail,
          mrp: item.mrp,
          price: item.price,
          openingStock: item.openingStock,
          status: item.status,
          images: item.images,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          companyCode: req.body.companyCode,
        });

        await newItem.save();
        itemId = newItem._id;
        console.log("Created new item:", newItem);
      }

      // Return the updated entry with the correct item ID for the target store
      return {
        itemName: itemId,
        qty: entry.qty,
        rate: entry.rate,
        unit: entry.unit,
        amount: entry.netAmount,
        tax: 0,
        sgst: 0.00,
        cgst: 0.00,
        discount: 0.00,
        igst: 0.00,
        netAmount: entry.netAmount,
        sellingPrice: entry.rate,
      };
    });

    // Wait for all updates to complete
    const updatedEntries = await Promise.all(updatePromises);

    // Save the delivery challan
    await deliveryChallan.save();

    // Create a purchase entry in the target store
    const purchaseEntry = new PurchaseModel({
      no: req.body.no,
      companyCode: req.body.companyCode,
      date: req.body.date,
      date2: req.body.date2,
      type: 'Cash',
      ledger: req.body.ledger,
      place: req.body.place,
      billNumber: req.body.no,
      remarks: '',
      totalamount: req.body.totalamount,
      cashAmount: 0.00,
      dueAmount: 0.00,
      roundoffDiff: 0.00,
      entries: updatedEntries,
      sundry: [],
    });

    // Save the purchase entry
    await purchaseEntry.save();

    // Send the response with the created delivery challan and purchase entry
    res.status(201).send({ deliveryChallan, purchaseEntry });
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
};

// For getting all inward challans
const getAllDeliveryChallans = async (req, res) => {
  try {
    const deliveryChallan = await DeliveryChallanModel.find();
    res.json({ success: true, data: deliveryChallan });
  } catch (error) {
    res.status(500).send(error);
  }
};

// For getting a single inward challan
const getDeliveryChallan = async (req, res) => {
  try {
    const deliveryChallan = await DeliveryChallanModel.findById(req.params.id);
    if (!deliveryChallan) {
      return res.status(404).send("Inward Challan not found");
    }
    res.status(200).send(deliveryChallan);
  } catch (error) {
    res.status(500).send(error);
  }
};


const getDeliveryChallanById = async (req, res) => {
  try {
    const deliveryChallan = await DeliveryChallanModel.findById(req.params.id);

    if (deliveryChallan) {
      res.json({ success: true, data: deliveryChallan });
    } else {
      res.json({ success: false, message: "deliveryChallan not found" });
    }
  } catch (ex) {
    res.json({ success: false, message: ex });
  }
};


// For updating a inward challan
const updateDeliveryChallan = async (req, res) => {
  try {
    const deliveryChallan = await DeliveryChallanModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!deliveryChallan) {
      return res.status(404).send("Inward Challan not found");
    }
    res.status(200).send(deliveryChallan);
  } catch (error) {
    res.status(500).send(error);
  }
};

// For deleting a inward challan
const deleteDeliveryChallan = async (req, res) => {
  try {
    const inwardChallan = await DeliveryChallanModel.findByIdAndDelete(
      req.params.id
    );
    if (!deliveryChallan) {
      return res.status(404).send("Inward Challan not found");
    }
    res.status(200).send(deliveryChallan);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  createDeliveryChallan,
  getAllDeliveryChallans,
  getDeliveryChallan,
  getDeliveryChallanById,
  updateDeliveryChallan,
  deleteDeliveryChallan,
};


