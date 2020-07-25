const express = require('express');
require('dotenv').config();
const app = express();

const userRouter = require('./src/api/user/user.router');
const productRouter = require('./src/api/product/product.router');
const orderRouter = require('./src/api/order/order.route');

app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/order', orderRouter);

app.listen(process.env.PORT, () => {
  console.log('Server is listening at port:', process.env.PORT);
});
