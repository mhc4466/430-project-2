const profilePage = (req, res) => {
  console.log(req);
  res.render('profile', {
    name: req.session.account.username,
  });
};

module.exports = {
  profilePage,
};
