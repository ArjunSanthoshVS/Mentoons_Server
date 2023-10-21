var express = require('express');
const userController = require('../controllers/userController');
var router = express.Router();

/* GET users listing. */
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/add_to_cart', userController.add_to_cart);
router.get('/cart_items', userController.cart_items);
router.get('/removeFromCart', userController.removeFromCart);
router.post('/checkout', userController.checkout);
router.get('/purchase_status', userController.purchase_status);
router.post('/subscription', userController.subscription);

module.exports = router;
