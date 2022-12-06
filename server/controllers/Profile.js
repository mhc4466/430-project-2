const username = 'user';

const getName = () => {

};

const profilePage = (req, res) => res.render('profile', {
  name: username,
});

module.exports = {
  profilePage,
  getName,
};
