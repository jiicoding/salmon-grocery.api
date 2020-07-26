const pool = require('../../config/database');
const moment = require('moment');

module.exports = {
  createOrder: async (data) => {
    try {
      const result = await pool.query(
        `insert into orders(user_id, status, address, total) values (?,?,?,?)`,
        [data.user_id, data.status, data.address, data.total]
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
  addProductIntoOrder: async (data) => {
    try {
      const result = await pool.query(
        `insert into productorder(order_id, product_id, quantity) values (?,?,?)`,
        [data.order_id, data.product_id, data.quantity]
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
  updateOrder: async (data) => {
    try {
      const shippedDate = data.shipped_date
        ? moment(data.shipped_date).format('YYYY-MM-DD HH:mm:ss')
        : null;
      await pool.query(
        `update orders set shipped_date=?, address=?, total=? where id=?;`,
        [shippedDate, data.address, data.total, data.id]
      );

      return {
        success: true,
        data: {
          message: 'Update order information success',
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
  updateOrderStatus: async (data) => {
    try {
      await pool.query(`update orders set status=? where id=?;`, [
        data.status,
        data.id,
      ]);

      return {
        success: true,
        data: {
          message: 'Update order status success',
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
  getProductsInOrder: async (id) => {
    try {
      const results = await pool.query(
        `
        SELECT product_id, quantity FROM productorder WHERE order_id = ?;
      `,
        [id]
      );
      if (results[0].length) {
        return results[0];
      }

      return [];
    } catch (error) {
      return [];
    }
  },
  getOrders: async (data) => {
    const { size, page } = data;
    try {
      const results = await pool.query(
        `SELECT * FROM orders LIMIT ${(page - 1) * size}, ${size};`
      );
      return results[0];
    } catch (error) {
      return [];
    }
  },
  getOrderById: async (id) => {
    try {
      const results = await pool.query(
        `
          SELECT * FROM orders WHERE id = ?;
        `,
        [id]
      );
      if (results[0].length) {
        return {
          success: true,
          data: results[0][0],
        };
      } else {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND_ORDER',
            message: `Not found product with id ${id}`,
          },
        };
      }
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
  getOrdersByUserId: async (data) => {
    const { size, page, userId } = data;
    try {
      const results = await pool.query(
        `
          SELECT * FROM orders WHERE user_id = ? LIMIT ${
            (page - 1) * size
          }, ${size};;
        `,
        [userId]
      );
      return results[0];
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
  getOrderByCreatedDate: async (data) => {
    const { size, page } = data;
    try {
      const results = await pool.query(
        `SELECT * FROM orders WHERE create_at >= ? AND create_at <= ? LIMIT ${
          (page - 1) * size
        }, ${size};`,
        [
          moment(data.from).format('YYYY-MM-DD HH:mm:ss'),
          moment(data.to).format('YYYY-MM-DD HH:mm:ss'),
        ]
      );
      return results[0];
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
  getOrderByShippedDate: async (data) => {
    const { size, page } = data;
    try {
      const results = await pool.query(
        `SELECT * FROM orders WHERE create_at >= ? AND shipped_date  <= ? LIMIT ${
          (page - 1) * size
        }, ${size};`,
        [
          moment(data.from).format('YYYY-MM-DD HH:mm:ss'),
          moment(data.to).format('YYYY-MM-DD HH:mm:ss'),
        ]
      );
      return results[0];
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
};
