const express = require('express');
const router = express.Router();
const basketController = require('../controllers/basketController');

router.post('/add', basketController.addToBasket);
router.get('/:userId', basketController.getBasket);
router.delete('/remove', basketController.removeFromBasket);
router.delete('/clear/:userId', basketController.clearBasket);

module.exports = router;
