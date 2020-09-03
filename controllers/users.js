const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const BadRequestError = require('../errors/bad-request-err');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
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
        if (err instanceof mongoose.Error.ValidationError || err.message.indexOf('duplicate key error') !== -1) {
          res.status(400).send({ message: err.message });
        }
        next(err);
      });
  }
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new BadRequestError('Нет такого пользователя');
    })
    // .then((user) => res.send({ user }))
    .then((user) => {
      console.log('USER', user);
      if (!user) {
        throw new BadRequestError('Нет такого пользователя');
      }
      res.send({ user });
    })
    .catch((err) => {
      // if (err instanceof mongoose.Error.CastError) {
      //   res.status(404).send({ message: 'Нет такого пользователя' });
      // }
      // res.status(500).send({ message: 'На сервере произошла ошибка' });
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, '30cc6cc609227eb7c5b6b529196fb497', { expiresIn: '7d' });
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
