const mongoose = require('mongoose');
const _ = require('underscore');

let BlocksetModel = {};

const setName = (name) => _.escape(name).trim();

const BlocksetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  visibilityLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
  },
  blocks: {
    type: Array,
    required: true,
  },
  /*
  startDay: {
    type: String,
    trim: true,
  },
  startTime: {
    type: Number,
    min: 0,
    max: 2359,
  },
  endDay: {
    type: String,
    trim: true,
  },
  endTime: {
    type: Number,
    min: 0,
    max: 2359,
  },
  */
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

BlocksetSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  visibilityLevel: doc.visibilityLevel,
  blocks: doc.blocks,
  /*
  startDay: doc.startDay,
  startTime: doc.startTime,
  endDay: doc.endDay,
  endTime: doc.endTime,
  */
});

BlocksetSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: mongoose.Types.ObjectId(ownerId),
  };

  return BlocksetModel.find(search).select('name blocks').lean().exec(callback);
};

BlocksetSchema.statics.deleteID = async (id) => {
  const search = {
    _id: mongoose.Types.ObjectId(id),
  };
  return BlocksetModel.findOneAndDelete(search).select('name').lean().exec();
};

BlocksetModel = mongoose.model('Blockset', BlocksetSchema);

module.exports = BlocksetModel;
