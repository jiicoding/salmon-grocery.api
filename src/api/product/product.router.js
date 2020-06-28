const { addProductToDb, getProducts } = require('./product.controller');
const router = require('express').Router();
const { checkToken } = require('../../utils/auth/tokenValidation');
const multer = require('multer');

const uploader = multer({ dest: 'src/public/upload' });

router.post(
  '/',
  checkToken,
  uploader.array('media', process.env.MAX_UPLOADED_IMAGE),
  addProductToDb
);

router.get('/', checkToken, getProducts);

module.exports = router;
