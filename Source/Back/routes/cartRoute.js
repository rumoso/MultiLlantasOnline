const { Router } = require('express');
const { getCart, addToCart, updateQuantity, removeFromCart, processPurchase } = require('../controllers/cartController');

const router = Router();

router.post('/get', getCart);
router.post('/add', addToCart);
router.put('/update', updateQuantity);
router.delete('/remove', removeFromCart);
router.post('/process', processPurchase);

module.exports = router;
