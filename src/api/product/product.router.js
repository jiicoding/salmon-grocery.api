const {
  addProductToDb,
  getProducts,
  getProductById,
  updateProductById,
} = require('./product.controller');
const router = require('express').Router();
const { checkToken, checkAdminToken } = require('../../utils/auth/tokenValidation');
const multer = require('multer');

const uploader = multer({ dest: 'src/public/upload' });

router.post(
  '/',
  checkAdminToken,
  uploader.array('media', process.env.MAX_UPLOADED_IMAGE),
  addProductToDb
);

router.get('/', checkToken, getProducts);
router.get('/:productId', checkToken, getProductById);
router.post('/:productId', checkAdminToken, updateProductById);

module.exports = router;
