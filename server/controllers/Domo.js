const models = require('../models');
const DomoModel = require('../models/Domo');

const { Domo } = models;

const makerPage = (req, res) => res.render('app');

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.weight) {
    return res.status(400).json({ error: 'Name, age, and body are all required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    weight: req.body.weight,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, age: newDomo.age, weight: newDomo.weight });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const deleteDomo = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Client failed to send Domo ID' });
  }

  try {
    Domo.deleteID(req.body._id);
    return res.status(200).json({ message: 'Domo deleted' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Could not delete Domo' });
  }
};

const getDomos = (req, res) => DomoModel.findByOwner(req.session.account._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error has occurred' });
  }
  console.log(docs);
  return res.json({ domos: docs });
});

module.exports = {
  makerPage,
  makeDomo,
  deleteDomo,
  getDomos,
};
