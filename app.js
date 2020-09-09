require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const validator = require('validator');
const users = require('./routes/users.js');
const { login, createUser } = require('./controllers/users.js');
const cards = require('./routes/cards.js');
const auth = require('./middlewares/auth.js');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');
const BadRequestError = require('./errors/bad-request-err');

const { PORT = 3000 } = process.env;

const app = express();
const vallidatorURL = (link) => {
  if (!validator.isURL(link)) {
    throw new BadRequestError('Невалидный url');
  } else {
    return link;
  }
};

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(helmet());
app.use(bodyParser());
app.use(cookieParser());
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
  headers: Joi.object().keys({
    'Content-Type': 'application/json',
  }).unknown(true),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom(vallidatorURL),
    about: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
  headers: Joi.object().keys({
    'Content-Type': 'application/json',
  }).unknown(true),
}), createUser);

app.use(auth);

app.use('/users', users);
app.use('/cards', cards);

app.use(errorLogger);
app.use(errors());

app.use(() => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError || err.message.indexOf('duplicate key error') !== -1 || err instanceof mongoose.Error.CastError) {
    res.status(400).send({ message: err.message });
  }
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT, () => {
});
