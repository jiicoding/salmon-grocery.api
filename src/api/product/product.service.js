const pool = require('../../config/database');

module.exports = {
  insertProduct: (data, callback) => {
    pool.query(
      `insert into Products(product_name, description, type, price) values (?,?,?,?)`,
      [data.product_name, data.description, data.type, data.price],
      (error, results) => {
        if (error) {
          return callback({
            code: error.code,
            message: error.sqlMessage,
          });
        }
        return callback(null, results);
      }
    );
  },
  insertProductImage: (data, callback) => {
    pool.query(
      `insert into ProductsMedia(product_id, image_url) values(?,?)`,
      [data.productId, data.url],
      (error, results) => {
        if (error) {
          return callback({
            code: error.code,
            message: error.sqlMessage,
          });
        }
        return callback(null, results);
      }
    );
  },
};
