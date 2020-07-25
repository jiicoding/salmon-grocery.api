const {
  addProductToDb,
  getProducts,
  getProductById,
  updateProductById,
} = require('./product.controller');
const router = require('express').Router();
const {
  checkToken,
  checkAdminToken,
} = require('../../utils/auth/tokenValidation');

router.post('/', checkAdminToken, addProductToDb);

router.get('/', checkToken, getProducts);
router.get('/:productId', checkToken, getProductById);
router.post('/:productId', checkAdminToken, updateProductById);

module.exports = router;
