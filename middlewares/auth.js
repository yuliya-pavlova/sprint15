const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-err');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new AuthError('Необходима авторизация');
  }
  let payload;

  try {
    payload = jwt.verify(token, '30cc6cc609227eb7c5b6b529196fb497');
  } catch (err) {
    next(err);
  }

  req.user = payload;

  return next();
};
