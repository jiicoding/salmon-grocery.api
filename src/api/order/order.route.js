const {
  createOrder,
  getOrderById,
  getOrders,
  getOrderByCreatedDate,
  getOrderByShippedDate,
  getOrderByUserId,
} = require('./order.controller');
const router = require('express').Router();
const { checkToken } = require('../../utils/auth/tokenValidation');

router.get('/', checkToken, getOrders);
router.get('/:orderId', checkToken, getOrderById);
router.post('/createdDate', checkToken, getOrderByCreatedDate);
router.post('/shippedDate', checkToken, getOrderByShippedDate);
router.post('/user', checkToken, getOrderByUserId);
router.post('/', checkToken, createOrder);

module.exports = router;
