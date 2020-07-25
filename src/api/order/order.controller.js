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
  updateOrder,
} = require('./order.service');

const {
  getProductById,
  updateProductAmount,
} = require('../product/product.service');
const { json } = require('express');

module.exports = {
  createOrder: async (req, res) => {
    const body = req.body;
    const { user_id, status, address, products } = body;
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

    if (!products || !products.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_USER',
          message: 'order total price can not be empty or null.',
        },
      });
    }

    let total = 0;

    let isOutofStock = [];
    let isNotEnough = [];

    const checkProducts = products.map(async (prod) => {
      if (isOutofStock.length || isNotEnough.length) return;

      const results = await getProductById(prod.product_id);

      if (!results.success) {
        return res.status(400).json(results);
      }

      const { amount, product_name, id, price } = results.data;

      if (amount <= 0) {
        isOutofStock.push({
          success: false,
          error: {
            code: 'OUT_OF_STOCK',
            message: `create order failed! product: ${product_name} is out of stock.`,
          },
        });
        return;
      }

      if (amount < prod.quantity) {
        isNotEnough.push({
          success: false,
          error: {
            code: 'NOT_ENOUGH_PROD',
            message: `create order failed! product: ${product_name} is not enough amount`,
          },
        });
        return;
      }

      total = total + price * prod.quantity;

      return {
        productId: id,
        amount,
        quantity: prod.quantity,
      };
    });

    const productsDetail = await Promise.all(checkProducts);

    if (isOutofStock.length) {
      return res.status(400).json(isOutofStock[0]);
    }

    if (isNotEnough.length) {
      return res.status(400).json(isNotEnough[0]);
    }

    const result = await createOrder({ ...body, total });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const { id } = result.data;

    const addProducts = productsDetail.map(async (prod) => {
      const { productId, amount, quantity } = prod;
      await updateProductAmount({ id: productId, amount: amount - quantity });
      const result = await addProductIntoOrder({
        order_id: id,
        product_id: productId,
        quantity: quantity,
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
    const { address, shipped_date } = body;
    const { orderId } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_ADDRESS',
          message: 'shipping address can not be empty or null.',
        },
      });
    }

    const results = await updateOrder({
      id: orderId,
      address,
      shipped_date,
    });

    if (!results.success) {
      return res.status(400).json(results);
    }

    return res.status(200).json(results);
  },
  updateOrderStatus: async (req, res) => {
    const body = req.body;
    const { status } = body;
    const { orderId } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_STATUS',
          message: 'order status can not be empty or null.',
        },
      });
    }

    if (!['submitted', 'canceled', 'shipping', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status',
        },
      });
    }

    const orderDetailResult = await getOrderById(orderId);

    if (!orderDetailResult.success) {
      return res.status(400).json(orderDetailResult);
    }

    const { status: currentOrderStatus } = orderDetailResult.data;

    if (['canceled', 'completed'].includes(currentOrderStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: `ORDER_${currentOrderStatus.toUpperCase()}`,
          message: `Update status failed! order current status is ${currentOrderStatus}`,
        },
      });
    }

    if (status === 'canceled') {
      const productsInOrder = await getProductsInOrder(orderId);

      const updateProductsAmount = productsInOrder.map(async (prod) => {
        const { product_id, quantity } = prod;
        const results = await getProductById(product_id);
        if (!results.success) {
          return json.status(400).json(results);
        }
        const { amount } = results.data;
        const newAmount = amount + quantity;

        await updateProductAmount({ id: product_id, amount: newAmount });
      });

      await Promise.all(updateProductsAmount);
    }

    const result = await updateOrderStatus({ id: orderId, status });

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
