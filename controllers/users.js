const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const BadRequestError = require('../errors/bad-request-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch((err) => {
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  if (req.body.password === undefined || req.body.password.length < 8) {
    throw new BadRequestError('Укажите пароль длиной не менее 8 символов');
  } else {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => User.create({
        email: req.body.email,
        password: hash,
        name: req.body.name,
        avatar: req.body.avatar,
        about: req.body.about,
      }))
      .then((user) => {
        const {
          email, name, about, avatar,
        } = user;
        res.send({
          email, name, about, avatar,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new BadRequestError('Нет такого пользователя');
    })
    .then((user) => {
      if (!user) {
        throw new BadRequestError('Нет такого пользователя');
      }
      res.send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .end();
    })
    .catch((err) => {
      next(err);
    });
};
