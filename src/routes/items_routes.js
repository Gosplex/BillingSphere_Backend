const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const ItemsController = require("../controllers/items_controller");
const verifyToken = require("../middleware/verifyToken");

// Create an item
router.post(
  "/create-item",
  verifyToken,
  upload.single("image"),
  ItemsController.createItem
);

// Get all items
router.get("/get-items/:companyCode", verifyToken, ItemsController.getItems);

// Get a specific item by ID
router.get("/get-item/:itemId", verifyToken, ItemsController.getItemById);

// Update a specific item by ID
router.put("/update-item/:itemId", verifyToken, ItemsController.updateItem);

// Delete a specific item by ID
router.delete("/delete-item/:itemId", verifyToken, ItemsController.deleteItem);

// Insert Multiple Items
router.post("/insert-many-items", ItemsController.insertItemsIntoDB);

// // Update All Items
router.put("/update-all-items", ItemsController.updateAllItems);

// Get Items by Barcode
router.get("/get-item-by-barcode/:barcode", verifyToken, ItemsController.getItemByBarCode);

module.exports = router;
