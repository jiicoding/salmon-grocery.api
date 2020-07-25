const {
  createOrder,
  getOrderById,
  getOrders,
  getOrderByCreatedDate,
  getOrderByShippedDate,
  getOrderByUserId,
} = require('./order.controller');
const router = require('express').Router();
const { checkToken, checkAdminToken } = require('../../utils/auth/tokenValidation');

router.get('/', checkAdminToken, getOrders);
router.get('/:orderId', checkToken, getOrderById);
router.post('/createdDate', checkAdminToken, getOrderByCreatedDate);
router.post('/shippedDate', checkAdminToken, getOrderByShippedDate);
router.post('/user', checkToken, getOrderByUserId);
router.post('/', checkToken, createOrder);

module.exports = router;
