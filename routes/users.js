const { createReadStream } = require('fs');
const path = require('path');
const router = require('express').Router();

const pathToProducts = path.join(__dirname, '../data/users.json');

router.get('/', (req, res) => {
  const reader = createReadStream(pathToProducts, { encoding: 'utf8' });

  reader.on('error', () => {
    res.status(500).send({ Error: 'Ошибка чтения файла' });
  });

  reader.on('open', () => {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    reader.pipe(res);
  });
});

router.get('/:id', (req, res) => {
  const reader = createReadStream(pathToProducts, { encoding: 'utf8' });
  let users = '';
  reader.on('data', (data) => {
    users += data;
  });
  reader.on('error', () => {
    res.status(500).send({ Error: 'Ошибка чтения файла' });
  });
  reader.on('end', () => {
    const usersList = JSON.parse(users);
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    const user = usersList.find((person) => person._id === req.params.id);
    if (!user) {
      res.status(404).send({ message: 'Нет пользователя с таким id' });
      return;
    }
    res.send(user);
  });
});
module.exports = router;
