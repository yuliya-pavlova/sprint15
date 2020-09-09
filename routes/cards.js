const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const router = require('express').Router();
const { createCard, getCards, deleteCard } = require('../controllers/cards');
const BadRequestError = require('../errors/bad-request-err');

const vallidatorURL = (link) => {
  if (!validator.isURL(link)) {
    throw new BadRequestError('Невалидный url');
  } else {
    return link;
  }
};

router.get('/', getCards);
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(vallidatorURL),
  }),
  headers: Joi.object().keys({
    'Content-Type': 'application/json',
  }).unknown(true),
}), createCard);
router.delete('/:id', deleteCard);

module.exports = router;
