const Card = require('../models/card');
const ForbiddenError = require('../errors/forbidden-err');
const BadRequestError = require('../errors/bad-request-err');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({ card }))
    .catch((err) => {
      next(err);
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('user')
    .then((cards) => res.send({ cards }))
    .catch((err) => {
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(() => {
      throw new BadRequestError('Нет такой карточки');
    })
    .then((card) => {
      if ((card.owner).toString() !== req.user._id) {
        throw new ForbiddenError('Нет прав на удаление карточки');
      }
      card.remove();
      return res.send({ card });
    })
    .catch((err) => {
      next(err);
    });
};
