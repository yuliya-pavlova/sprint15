const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const users = require('./routes/users.js');
const { login, createUser } = require('./controllers/users.js');
const cards = require('./routes/cards.js');
const auth = require('./middlewares/auth.js');
const helmet = require('helmet');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(helmet());
app.use(bodyParser());
app.use(cookieParser());

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/users', users);
app.use('/cards', cards);

app.use((req, res) => {
  res.status('404');
  res.send({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT, () => {
});
