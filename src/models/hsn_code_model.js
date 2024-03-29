const { Schema, model } = require('mongoose');

const hsnCodeSchema = new Schema({

    hsn: { type: String, required: [true, 'hsn is required'] },
    user_id: { type: String, required: [true, 'hsn is required'] },
    updatedOn: { type: Date },
    createdOn: { type: Date }
});

hsnCodeSchema.pre('save', function (next) {
    this.updateOn = new Date();
    this.createdOn = new Date();
    next();
});

hsnCodeSchema.pre(['update', 'findOneAndUpdate', 'updateOne'], function (next) {
    const update = this.getUpdate();
    delete update._id;
    this.updateOn = new Date();
    next();
});

const HSNModel = model('HSN', hsnCodeSchema);
module.exports = HSNModel;
