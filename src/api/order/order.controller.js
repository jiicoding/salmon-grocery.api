const {
  createOrder,
  addProductIntoOrder,
  updateOrderStatus,
  getOrderById,
  getProductsInOrder,
  getOrders,
  getOrdersByUserId,
  getOrderByCreatedDate,
  getOrderByShippedDate,
} = require('./order.service');

const { getProductById } = require('../product/product.service');

module.exports = {
  createOrder: async (req, res) => {
    const body = req.body;
    const { user_id, status, address, total, products } = body;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_USER',
          message: 'user id can not be empty or null.',
        },
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_STATUS',
          message: 'order status can not be empty or null.',
        },
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_ADDRESS',
          message: 'shipping address can not be empty or null.',
        },
      });
    }

    if (!total) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_TOTAL',
          message: 'order total price can not be empty or null.',
        },
      });
    }

    if (!products || !products.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_USER',
          message: 'order total price can not be empty or null.',
        },
      });
    }

    const result = await createOrder(body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const { id } = result.data;

    const addProducts = products.map(async (prod) => {
      if (prod.quantity <= 0 || prod.quantity > prod.amount) {
        return {
          success: false,
          error: {
            code: 'WRONG_QUANTITY',
            message: `item's quantity is invalid`,
          },
        };
      }
      const result = await addProductIntoOrder({
        order_id: id,
        product_id: prod.product_id,
        quantity: prod.quantity,
      });

      return result;
    });

    await Promise.all(addProducts);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Create order success',
      },
    });
  },
  updateOrder: async (req, res) => {
    const body = req.body;
    const { status } = body;
    const { orderId } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_STATUS',
          message: 'Product status can not be empty or null.',
        },
      });
    }

    const result = await updateOrderStatus({ id: orderId, ...body });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  },
  getOrders: async (req, res) => {
    const { page: reqPage, size: reqSize } = req.query;
    let page = 0;
    let size = 10;

    if (reqPage && reqPage > 0 && parseInt(reqPage) !== NaN) {
      page = Math.floor(reqPage);
    }

    if (reqSize && reqSize > 0 && parseInt(reqSize) !== NaN) {
      size = Math.floor(reqSize);
    }

    const results = await getOrders({ size, page });

    if (!results.success) {
      return res.status(400).json(results);
    }

    return res.status(200).json(results);
  },
  getOrderById: async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_FOUND_ORDER',
          message: 'Order id is required.',
        },
      });
    }

    const results = await getOrderById(orderId);

    if (!results.success) {
      return res.status(400).json(results);
    }

    const { data } = results;

    const orderProducts = await getProductsInOrder(orderId);
    const getProductDetail = orderProducts.map(async (e) => {
      const results = await getProductById(e.product_id);
      if (results.success) {
        const { data } = results;
        const { product_name, description, type, price } = data;
        return {
          ...e,
          product_name,
          description,
          type,
          price,
        };
      }
    });

    const productData = await Promise.all(getProductDetail);

    return res.status(200).json({
      success: true,
      data: {
        ...data,
        products: productData,
      },
    });
  },
  getOrderByUserId: async (req, res) => {
    const body = req.body;
    const { userId } = body;
    const { page: reqPage, size: reqSize } = req.query;
    let page = 0;
    let size = 10;

    if (reqPage && reqPage > 0 && parseInt(reqPage) !== NaN) {
      page = Math.floor(reqPage);
    }

    if (reqSize && reqSize > 0 && parseInt(reqSize) !== NaN) {
      size = Math.floor(reqSize);
    }

    const results = await getOrdersByUserId({
      userId,
      size,
      page,
    });

    if (!results.success) {
      return res.status(400).json(results);
    }

    return res.status(200).json(results);
  },
  getOrderByCreatedDate: async (req, res) => {
    const body = req.body;
    const { from, to } = body;
    const { page: reqPage, size: reqSize } = req.query;
    let page = 0;
    let size = 10;

    if (reqPage && reqPage > 0 && parseInt(reqPage) !== NaN) {
      page = Math.floor(reqPage);
    }

    if (reqSize && reqSize > 0 && parseInt(reqSize) !== NaN) {
      size = Math.floor(reqSize);
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DATE_RANGE_INVALID',
          message: 'Date range is not valid.',
        },
      });
    }

    const results = await getOrderByCreatedDate({ from, to, size, page });

    if (!results.success) {
      return res.status(400).json(results);
    }

    return res.status(200).json(results);
  },
  getOrderByShippedDate: async (req, res) => {
    const body = req.body;
    const { from, to } = body;
    const { page: reqPage, size: reqSize } = req.query;
    let page = 0;
    let size = 10;

    if (reqPage && reqPage > 0 && parseInt(reqPage) !== NaN) {
      page = Math.floor(reqPage);
    }

    if (reqSize && reqSize > 0 && parseInt(reqSize) !== NaN) {
      size = Math.floor(reqSize);
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DATE_RANGE_INVALID',
          message: 'Date range is not valid.',
        },
      });
    }

    const results = await getOrderByShippedDate({ from, to, size, page });

    if (!results.success) {
      return res.status(400).json(results);
    }

    return res.status(200).json(results);
  },
};
