const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }
  let payload;

  try {
    payload = jwt.verify(token, '30cc6cc609227eb7c5b6b529196fb497');
  } catch (err) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload;

  return next();
};
