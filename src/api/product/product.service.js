const pool = require('../../config/database');
const path = require('path');

module.exports = {
  insertProduct: async (data) => {
    try {
      const result = await pool.query(
        `insert into Products(product_name, description, type, price) values (?,?,?,?)`,
        [data.product_name, data.description, data.type, data.price]
      );
      const { insertId } = result[0];
      return {
        success: true,
        data: {
          id: insertId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }
  },
  insertProductImage: async (data) => {
    try {
      await pool.query(
        `insert into ProductsMedia(product_id, image_url) values(?,?)`,
        [data.productId, data.url]
      );
      return {
        success: true,
        image: data.image_name,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }
  },
  getProducts: async (data) => {
    const { size, page, keyword } = data;
    try {
      const results = await pool.query(
        `SELECT * FROM Products WHERE product_name LIKE '%${keyword}%' LIMIT ${
          (page - 1) * size
        }, ${size};`
      );
      if (!results[0].length) {
        return [];
      }
      return results[0];
    } catch (error) {
      return [];
    }
  },
  getMediaById: async (id) => {
    const results = await pool.query(
      `SELECT image_url FROM ProductsMedia WHERE product_id=?;`,
      [id]
    );
    if (!results[0].length) {
      return [];
    }
    const mapImages = results[0].map((img) => path.resolve(img.image_url));
    return mapImages;
  },
};
