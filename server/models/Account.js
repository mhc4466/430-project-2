/* This file defines our schema and model interface for the account data.

   We first import bcrypt and mongoose into the file. bcrypt is an industry
   standard tool for encrypting passwords. Mongoose is our tool for
   interacting with our mongo database.
*/
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
// const { Account } = require('.');

/* When generating a password hash, bcrypt (and most other password hash
   functions) use a "salt". The salt is simply extra data that gets hashed
   along with the password. The addition of the salt makes it more difficult
   for people to decrypt the passwords stored in our database. saltRounds
   essentially defines the number of times we will hash the password and salt.
*/
const saltRounds = 10;

let AccountModel = {};

/* Our schema defines the data we will store. A username (string of alphanumeric
   characters), a password (actually the hashed version of the password created
   by bcrypt), and the created date.
*/
const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  password: {
    type: String,
    required: true,
  },
  friends: {
    type: Array,
    default: [],
  },
  about: {
    type: String,
    default: 'Hello!',
  },
  premium: {
    type: Boolean,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Converts a doc to something we can store in redis later on.
AccountSchema.statics.toAPI = (doc) => ({
  username: doc.username,
  _id: doc._id,
});

// Helper function to hash a password
AccountSchema.statics.generateHash = (password) => bcrypt.hash(password, saltRounds);

/* Helper function for authenticating a password against one already in the
   database. Essentially when a user logs in, we need to verify that the password
   they entered matches the one in the database. Since the database stores hashed
   passwords, we need to get the hash they have stored. We then pass the given password
   and hashed password to bcrypt's compare function. The compare function hashes the
   given password the same number of times as the stored password and compares the result.
*/
AccountSchema.statics.authenticate = async (username, password, callback) => {
  try {
    const doc = await AccountModel.findOne({ username }).exec();
    if (!doc) {
      return callback();
    }

    const match = await bcrypt.compare(password, doc.password);
    if (match) {
      return callback(null, doc);
    }
    return callback();
  } catch (err) {
    return callback(err);
  }
};

AccountSchema.statics.getUserByName = async (name, callback) => {
  const search = { username: name };
  return AccountModel.findOne(search).select('username id about').lean().exec(callback);
};

// https://stackoverflow.com/questions/38970835/mongodb-add-element-to-array-if-not-exists
// Friend interactions can be either confirm or not.
//  A non-confirm is a request. It should only work all three conditions:
//    1: Users are not already friends
//    2: If the recipient has no pending request from the sender
//    3: SPECIAL: If the sender has a pending request from the sender,
//        in which case, confirm the request
//  A confirm is an acceptance of a pending request. Conditions:
//    1: The sender has an incoming request from the recipient
//    2: Users are not already friends (unlikely, but worth checking)
AccountSchema.statics.friendInteraction = async (confirm, sender, recipient, callback) => {
  const recpSearch = { _id: mongoose.Types.ObjectId(recipient) };
  const recpDoc = await AccountModel.findOne(recpSearch).select('username friends').lean().exec();
  console.log(recpDoc);
  if (recpDoc && !recpDoc.friends) {
    console.log(await AccountModel.updateOne(
      { _id: recipient },
      { $set: { friends: [] } },
    ));
  }

  // If confirm is true, this should mean sender is confirming a request from recipient,
  //  necessitating sender has recipient as an incoming friend
  if (confirm === 'true') {
    const search = { _id: mongoose.Types.ObjectId(sender) };
    const doc = await AccountModel.findOne(search).select('username friends').lean().exec();
    console.log('Result');
    console.log(doc);
    if (!doc) {
      return callback('selfNotFound');
    }

    // If the friends array doesn't exist (i.e. from testing), make it
    if (!doc.friends) {
      AccountModel.updateOne(
        { _id: sender },
        { $set: { friends: [] } },
      );
    }
    if (doc.friends) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
      // If conditions met, set them as confirmed friends

      // Tries to find the recipient in the sender's friends array
      const friend = doc.friends.find((element) => {
        if (element._id === recipient && element.level === 100) {
          return true;
        }
        return false;
      });

      if (friend) {
        // Sets the level of the recipient in the sender's list to 3
        AccountModel.updateOne(
          { _id: sender, 'friends._id': recipient },
          { $set: { 'friends.$.level': 3 } },
        );
        // Sets the level of the sender in the recipient's list to 3
        AccountModel.updateOne(
          { _id: recipient },
          {
            $addToSet: {
              friends: {
                _id: sender,
                level: 3,
              },
            },
          },
        );
        return callback('added');
      }
      return callback('notPending');
    }
    return callback('friendsRepairFailed');

  // If confirm is false, then this is an attempt to add someone as a friend
  }
  // Get the sender
  const search = { _id: mongoose.Types.ObjectId(sender) };
  const doc = await AccountModel.findOne(search).select('username friends').lean().exec();

  // If the friends array doesn't exist, make it
  if (!doc.friends) {
    await AccountModel.updateOne(
      { _id: sender },
      { $set: { friends: [] } },
    );
  }
  console.log(doc);

  if (doc.friends) {
    // Checks if they are already friends or pending; if so, tell the controller such
    const friend = doc.friends.find((element) => {
      if (element._id === recipient) {
        return true;
      }
      return false;
    });
    if (friend && friend.level < 4) {
      return callback('alreadyFriends');
      // If the sender has a pending request from the recipient, go ahead and accept
    } if (friend && friend.level === 100) {
      // Sets the level of the recipient in the sender's list to 3
      /*
        AccountModel.updateOne(
          { _id: sender, 'friends._id': recipient },
          { $set: { 'friends.$.level': 3 } },
        );
        */
      await AccountModel.updateOne(
        { _id: sender, 'friends._id': recipient },
        { $set: { 'friends.$.level': 3 } },
      );
      // Sets the level of the sender in the recipient's list to 3
      await AccountModel.updateOne(
        { _id: recipient },
        {
          $set: {
            friends: {
              _id: sender,
              level: 3,
            },
          },
        },
      );
      return callback('added');
      // Check if the recipient already has a pending request from the sender
    } if (recpDoc.friends.find((element) => {
      if (element._id === sender && element.level === 100) {
        return true;
      }
      return false;
    })) {
      return callback('alreadyPending');
    }
    const newFriend = {
      _id: sender,
      username: doc.username,
      level: 100,
    };
    AccountModel.updateOne(
      { _id: recipient },
      { $push: { friends: newFriend } },
      (err, docs) => {
        if (err) {
          console.log(err);
        }
        console.log(docs);
      },
    );
    return callback('sent');
  }
  return callback('friendsRepairFailed');
};

AccountModel = mongoose.model('Account', AccountSchema);
module.exports = AccountModel;
