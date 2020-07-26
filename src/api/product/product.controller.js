const {
  insertProduct,
  insertProductImage,
  getProducts,
  getProductById,
  updateProduct,
  getMediaById,
} = require('./product.service');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

module.exports = {
  addProductToDb: async (req, res) => {
    const body = req.body;
    let images = req.files.media || [];
    const { product_name, type, price, amount } = body;
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

    if (!amount || isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Invalid amount',
        },
      });
    }

    if (!Array.isArray(images)) {
      images = [{ ...images }];
    }

    const result = await insertProduct(body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const { id } = result.data;
    const saveProductMedia = images.map(async (img) => {
      try {
        const result = await cloudinary.uploader.upload(img.tempFilePath);
        const { url } = result;
        const saveImageResult = await insertProductImage({
          productId: id,
          url: url,
          image_name: img.name,
        });

        return saveImageResult;
      } catch (error) {
        return {
          succees: false,
          image_name: img.name,
        };
      }
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
  updateProductById: async (req, res) => {
    const { productId } = req.params;
    const body = req.body;
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

    const result = await updateProduct({ id: productId, ...body });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  },
  getProductById: async (req, res) => {
    const { productId } = req.params;

    const result = await getProductById(productId);

    if (result.success) {
      const productMedia = await getMediaById(productId);

      return res.status(200).json({
        success: true,
        data: {
          ...result.data,
          images: productMedia,
        },
      });
    }

    return res.status(400).json(result);
  },
};
