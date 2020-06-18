const { create, getUserByUsername } = require('./user.service');
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const { sign } = require('jsonwebtoken');

module.exports = {
  createUser: (req, res) => {
    const body = req.body;
    const { username, password, phone_number, full_name } = body;
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'username can not be empty or null.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'password can not be empty or null.',
      });
    }

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        error: 'phone_number can not be empty or null.',
      });
    }

    if (!full_name) {
      return res.status(400).json({
        success: false,
        error: 'full_name can not be empty or null.',
      });
    }

    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);

    create(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err,
        });
      }
      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  },
  login: (req, res) => {
    const body = req.body;
    getUserByUsername(body.username, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Username not found',
        });
      }

      if (!results) {
        return res.status(200).json({
          success: false,
          error: 'Username not found',
        });
      }

      const result = compareSync(body.password, results.password);
      if (result) {
        results.password = undefined;
        const jsontoken = sign({ result: results }, process.env.SECRET_KEY, {
          expiresIn: '7d',
        });

        return res.status(200).json({
          success: true,
          token: jsontoken,
        });
      } else {
        return res.status(200).json({
          success: false,
          error: 'password is incorrect',
        });
      }
    });
  },
};
