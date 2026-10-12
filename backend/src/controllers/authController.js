const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const authData = await authService.login(username, password);
    res.json({
      success: true,
      message: 'Authentication successful',
      token: authData.token,
      user: authData.user
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  getMe
};
