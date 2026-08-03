const { Router } = require('express');
const { getCart, addToCart, updateQuantity, removeFromCart } = require('../controllers/cartController');

const router = Router();

router.post('/get', getCart);
router.post('/add', addToCart);
router.put('/update', updateQuantity);
router.delete('/remove', removeFromCart);
// POST /process se retiro: el cobro real vive en /api/checkout (crear-orden + webhook).

module.exports = router;
