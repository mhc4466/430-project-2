const models = require('../models');
const AccountModel = require('../models/Account');
const BlocksetModel = require('../models/Blockset');

const { Account } = models;

const getToken = (req, res) => res.json({ csrfToken: req.csrfToken() });

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const getUserByName = (req, res) => {
  AccountModel.getUserByName(req.query.name, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    console.log(doc);
    return res.json({ user: doc });
  });
};

const requestFriend = async (req, res) => {
  const { confirm } = req.body;
  const sender = req.session.account._id;
  const { recipient } = req.body;

  if (!sender || !recipient) {
    return res.status(400).json({ error: 'Server did not receive both users in interaction' });
  }
  // const recipientDoc = await AccountModel.getUserByName(recipient);

  if (sender === recipient) {
    return res.status(400).json({ error: 'Cannot add self as friend' });
  }

  try {
    AccountModel.friendInteraction(confirm, sender, recipient, (code) => {
      switch (code) {
        case 'selfNotFound':
          return res.status(500).json({ error: 'Server couldn\'t get document of own user' });
        case 'added':
          return res.status(200).json({ message: 'Confirmed friend addition' });
        case 'notPending':
          return res.status(400).json({ error: 'Could not find request to accept' });
        case 'friendsRepairFailed':
          return res.status(500).json({ error: 'Server could not restore friends list' });
        case 'alreadyFriends':
          return res.status(400).json({ error: 'User is already friend' });
        case 'alreadyPending':
          return res.status(400).json({ error: 'User already has a pending request' });
        case 'sent':
          return res.status(200).json({ message: 'Friend request sent' });
        case 'error':
          return res.status(500).json({ error: 'Could not fulfill friend interaction request' });
        default:
          return res.status(500).json({ error: 'Unexpected behavior' });
      }
    });
    // return res.json(500).json({ error: 'Unexpected behavior' });
  } catch (err) {
    return res.status(500).json({ error: 'An error occurred' });
  }
  return false;
};

const addFriend = (req, res) => {
  const user1 = req.session.account._id;
  const user2 = req.body.other;
  console.log(user1);
  console.log(user2);
  return res.status(200).json({ message: 'test' });
};

// Finds all users who have this user added as a friend
const getFriends = async (req, res) => {
  const user = req.session.account._id;
  let search = { _id: user, level: { $lt: 4 } };
  search = { friends: user };
  search = { 'friends._id': user, 'friends.level': { $lt: 4 } };
  const friendDocs = await AccountModel.find(search).select('_id username premium');

  const friendObjs = [];
  friendDocs.forEach((friendDoc) => {
    const friendObj = {
      _id: friendDoc._id,
      username: friendDoc.username,
      avail: 'Not scheduled',
      premium: friendDoc.premium,
    };
    // friendDoc.avail = false;
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    console.log(now);
    BlocksetModel.find({ owner: friendDoc._id }).select('visibility blocks name').exec((err, docs) => {
      const blocksets = docs;
      console.log(blocksets);
      // Iterate through all blocksets a user owns
      blocksets.forEach((blockset) => {
        const { blocks } = blockset;
        // Iterate through all blocks in a blockset
        if (blocks && blocks.length && blocks.length > 0) {
          blocks.forEach((block) => {
            const startHour = block.startTime.substring(0, block.startTime.indexOf(':'));
            const startMinute = block.startTime.substring(block.startTime.indexOf(':') + 1);
            const endHour = block.endTime.substring(0, block.endTime.indexOf(':'));
            const endMinute = block.endTime.substring(block.endTime.indexOf(':') + 1);

            // Verify that the time is after the start
            if (
              day > block.startDay
              || (day === block.startDay && hour > startHour && minute > startMinute)) {
              // Verify that the time is before the end
              if (
                day < block.endDay
                  || (day === block.endDay && hour < endHour && minute < endMinute)
              ) {
                if (friendObj.premium) {
                  friendObj.avail = 'Scheduled now';
                } else {
                  friendObj.avail = blockset.name;
                }
              }
            }
          });
        }
      });
    });
    friendObjs.push(friendObj);
  });

  // Go through each friend doc, look through the blocksets owned by that friend, and
  //  if any blockset contains the current time, then set a boolean to true
  /*
  for (const friendDoc of friendDocs) {
    const friendObj = {
      _id: friendDoc._id,
      username: friendDoc.username,
      avail: 'Not scheduled',
      premium: friendDoc.premium,
    };
    // friendDoc.avail = false;
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    console.log(now);
    const blocksets = BlocksetModel.find({ owner: friendDoc._id }).select('visibility blocks name');
    console.log(blocksets);
    // Iterate through all blocksets a user owns
    for (const blockset of blocksets) {
      const { blocks } = blockset;
      // Iterate through all blocks in a blockset
      if (blocks && blocks.length && blocks.length > 0) {
        for (const block of blocks) {
          const startHour = block.startTime.substring(0, block.startTime.indexOf(':'));
          const startMinute = block.startTime.substring(block.startTime.indexOf(':') + 1);
          const endHour = block.endTime.substring(0, block.endTime.indexOf(':'));
          const endMinute = block.endTime.substring(block.endTime.indexOf(':') + 1);

          // Verify that the time is after the start
          if (
            day > block.startDay
            || (day === block.startDay && hour > startHour && minute > startMinute)) {
            // Verify that the time is before the end
            if (
              day < block.endDay
                || (day === block.endDay && hour < endHour && minute < endMinute)
            ) {
              if (friendObj.premium) {
                friendObj.avail = 'Scheduled now';
              } else {
                friendObj.avail = blockset.name;
              }
            }
          }
        }
      }
    }
    friendObjs.push(friendObj);
  }
  */
  console.log(friendObjs);
  return res.json({ friends: friendObjs });
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

module.exports = {
  getToken,
  loginPage,
  login,
  logout,
  signup,
  getUserByName,
  requestFriend,
  addFriend,
  getFriends,
  notFound,
};
