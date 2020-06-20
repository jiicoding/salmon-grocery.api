const { insertProduct, insertProductImage } = require('./product.service');
const fs = require('fs');
const path = require('path');

module.exports = {
  addProductToDb: (req, res) => {
    const body = req.body;
    const images = req.files || [];
    const { product_name, type, price } = body;
    if (!product_name) {
      return res.status(400).json({
        success: false,
        error: 'product name can not be empty or null.',
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'type can not be empty or null.',
      });
    }

    if (!price) {
      return res.status(400).json({
        success: false,
        error: 'price can not be empty or null.',
      });
    }

    insertProduct(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err,
        });
      }

      let uploadedImageError = [];

      images.forEach((img) => {
        let imageName = img.originalname || '';
        imageName = imageName.trim().replace(/ /g, '-');
        let imagePath = img.path;
        imagePath = `${imagePath}-${imageName}`;
        fs.renameSync(img.path, imagePath);
        insertProductImage(
          {
            productId: results.insertId,
            url: imagePath,
          },
          (err, results) => {
            if (err) {
              uploadedImageError.push(err);
            }
          }
        );
      });

      return res.status(200).json({
        success: true,
        media: {
          success: !!uploadedImageError.length,
          error: uploadedImageError,
        },
        data: results,
      });
    });
  },
};
