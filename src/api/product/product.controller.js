const {
  insertProduct,
  insertProductImage,
  getProducts,
  getMediaById,
} = require('./product.service');
const fs = require('fs');

module.exports = {
  addProductToDb: async (req, res) => {
    const body = req.body;
    const images = req.files || [];
    const { product_name, type, price } = body;
    if (!product_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_PRODUCT_NAME',
          message: 'product name can not be empty or null.',
        },
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_TYPE',
          message: 'type can not be empty or null.',
        },
      });
    }

    if (!price) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_PRICE',
          message: 'price can not be empty or null.',
        },
      });
    }

    const result = await insertProduct(body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const { id } = result.data;

    const saveProductMedia = images.map(async (img) => {
      let imageName = img.originalname || '';
      imageName = imageName.trim().replace(/ /g, '-');
      let imagePath = img.path;
      imagePath = `${imagePath}-${imageName}`;
      fs.renameSync(img.path, imagePath);
      const saveImageResult = await insertProductImage({
        productId: id,
        url: imagePath,
        image_name: imageName,
      });

      return saveImageResult;
    });

    const saveMediaResult = await Promise.all(saveProductMedia);

    return res.status(200).json({
      ...result,
      data: {
        ...result.data,
        imageUploaded: saveMediaResult,
      },
    });
  },
  getProducts: async (req, res) => {
    const { page: reqPage, size: reqSize, key } = req.query;
    let keyword = key || '';
    let page = 0;
    let size = 10;

    if (reqPage && reqPage > 0 && parseInt(reqPage) !== NaN) {
      page = Math.floor(reqPage);
    }

    if (reqSize && reqSize > 0 && parseInt(reqSize) !== NaN) {
      size = Math.floor(reqSize);
    }

    const products = await getProducts({ size, page, keyword });

    const getProductMedia = products.map(async (prod) => {
      const images = await getMediaById(prod.id);
      return {
        ...prod,
        images,
      };
    });

    const data = await Promise.all(getProductMedia);

    return res.status(200).json({
      success: true,
      data,
    });
  },
};
