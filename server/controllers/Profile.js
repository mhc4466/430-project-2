let username = "user";

const getName = () => {
    
};

const profilePage = (req, res) => {
    return res.render('profile', {
        name: getName
    });
};

module.exports = {
    profilePage,
    getName,
};
