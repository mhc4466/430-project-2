const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getBlocksets', mid.requiresLogin, controllers.Blockset.getBlocksets);
  app.get('/getSchedule', mid.requiresLogin, controllers.Blockset.getSchedule);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Blockset.makerPage);
  app.post('/newBlockset', mid.requiresLogin, controllers.Blockset.newBlockset);
  app.post('/maker', mid.requiresLogin, controllers.Blockset.makeBlockset);
  app.post('/newBlock', mid.requiresLogin, controllers.Blockset.newBlock);

  app.post('/delete', mid.requiresLogin, controllers.Blockset.deleteBlockset);
  app.post('/deleteBlockset', mid.requiresLogin, controllers.Blockset.deleteBlockset);
  app.post('/deleteBlock', mid.requiresLogin, controllers.Blockset.deleteBlock);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
