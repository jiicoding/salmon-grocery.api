const express = require('express');
require('dotenv').config();
const app = express();

const userRouter = require('./src/api/user/user.router');

app.use(express.json());

app.use('/api/user', userRouter);

app.listen(process.env.APP_PORT, () => {
  console.log('Server is listening at port:', process.env.APP_PORT);
});
