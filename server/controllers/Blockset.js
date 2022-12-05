const models = require('../models');
const BlocksetModel = require('../models/Blockset');

const { Blockset } = models;

const makerPage = (req, res) => res.render('app');

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

const newBlockset = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

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
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Blockset already exists' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

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

const deleteBlockset = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Client failed to send Blockset ID' });
  }

  try {
    Blockset.deleteID(req.body._id);
    return res.status(200).json({ message: 'Blockset deleted' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Could not delete Blockset' });
  }
};

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
  getBlocksets,
  getSchedule,
};
