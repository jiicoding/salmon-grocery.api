const express = require('express');
require('dotenv').config();
const app = express();

app.get('/api', (req, res) => {
  res.json({
    success: 1,
    message: 'hello',
  });
});

app.listen(process.env.APP_PORT, () => {
  console.log('Server is listening at port:', process.env.APP_PORT);
});

