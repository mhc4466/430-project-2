const models = require('../models');
const BlocksetModel = require('../models/Blockset');

const { Blockset } = models;

const makerPage = (req, res) => res.render('app');

// Unused in favor of newBlockset
const makeBlockset = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const blocksetData = {
    name: req.body.name,
    owner: req.session.account._id,
  };

  try {
    const newBlockset = new Blockset(blocksetData);
    await newBlockset.save();
    return res.status(201).json({ name: newBlockset.name });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Blockset already exists' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

// Create a new blockset in the database
// Set its name and visibility to those requested by the user
// Owner is set to the user who sent the request
// Blocks is initialized as blank array
const newBlockset = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Combine data
  const blocksetData = {
    name: req.body.name,
    visibility: req.body.visibility,
    blocks: [],
    owner: req.session.account._id,
  };

  try {
    const addedBlockset = new Blockset(blocksetData);
    await addedBlockset.save();
    return res.status(201).json({ name: addedBlockset.name, visiblity: addedBlockset.visiblity });
  } catch (err) {
    console.log(err);
    // Forbid exact duplicates (may be impossible)
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Blockset already exists' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

// Add the provided block data to the specified blockset
const newBlock = (req, res) => {
  if (!req.body.blocksetId || !req.body.block) {
    return res.status(400).json({ error: 'Client failed to provide new block to add' });
  }

  BlocksetModel.addBlock(req.body.blocksetId, req.body.block, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred while adding a block to a blockset' });
    }
    console.log(docs);
    return res.json({ blocksets: docs });
  });
  return 1;
};

// Use ID to find and delete blockset
const deleteBlockset = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Server failed to receive Blockset ID from client' });
  }

  try {
    Blockset.deleteID(req.body._id);
    return res.status(200).json({ message: 'Blockset deleted' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Could not delete Blockset' });
  }
};

// Under blockset of provided ID, find and delete block of other provided ID
const deleteBlock = async (req, res) => {
  if (!req.body._id || !req.body._bsid) {
    return res.status(400).json({ error: 'Server failed to receive an ID from client' });
  }
  try {
    Blockset.deleteBlockByUUID(req.body._bsid, req.body._id);
    return res.status(200).json({ message: 'Blockset deleted' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Could not delete Blockset' });
  }
};

// Unused in favor of getSchedule
const getBlocksets = (req, res) => {
  BlocksetModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error has occurred' });
    }
    console.log(docs);
    return res.json({ blocksets: docs });
  });
};

// Gets all blocksets that belong to the user who sent the request
const getSchedule = (req, res) => {
  BlocksetModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error has occurred while getting user\'s own schedule' });
    }
    console.log(docs);
    return res.json({ blocksets: docs });
  });
};

module.exports = {
  makerPage,
  makeBlockset,
  newBlockset,
  newBlock,
  deleteBlockset,
  deleteBlock,
  getBlocksets,
  getSchedule,
};
