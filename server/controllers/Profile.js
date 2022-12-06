// const username = 'user';

const getName = () => {

};

const profilePage = (req, res) => {
  res.render('profile', {
    name: req.session.account.username,
  });
};

module.exports = {
  profilePage,
  getName,
};
