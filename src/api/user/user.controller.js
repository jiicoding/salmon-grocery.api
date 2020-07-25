const {
  create,
  getUserByUsername,
  createAdminUser,
} = require('./user.service');
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const { sign } = require('jsonwebtoken');

module.exports = {
  createUser: async (req, res) => {
    const body = req.body;
    const { username, password, phone_number, full_name } = body;
    if (!username) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_USERNAME',
          message: 'username can not be empty or null.',
        },
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_PASSWORD',
          message: 'password can not be empty or null.',
        },
      });
    }

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_PHONE_NUMBER',
          message: 'phone_number can not be empty or null.',
        },
      });
    }

    if (!full_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_FULL_NAME',
          message: 'full_name can not be empty or null.',
        },
      });
    }

    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);

    const result = await create(body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  },
  createAdminUser: async (req, res) => {
    const body = req.body;
    const { username, password, phone_number, full_name } = body;
    if (!username) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_USERNAME',
          message: 'username can not be empty or null.',
        },
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_PASSWORD',
          message: 'password can not be empty or null.',
        },
      });
    }

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_PHONE_NUMBER',
          message: 'phone_number can not be empty or null.',
        },
      });
    }

    if (!full_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_FULL_NAME',
          message: 'full_name can not be empty or null.',
        },
      });
    }

    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);

    const result = await createAdminUser(body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  },
  login: async (req, res) => {
    const body = req.body;
    const result = await getUserByUsername(body.username);
    if (!result.success) {
      return res.status(400).json(result);
    }

    const { id, password } = result.data;

    const compareResult = compareSync(body.password, password);
    if (compareResult) {
      let responseData = { ...result.data };

      const jsontoken = sign(
        { userId: id, role: responseData.role },
        process.env.SECRET_KEY,
        {
          expiresIn: '24h',
        }
      );

      delete responseData.id;
      delete responseData.password;
      delete responseData.role;
      delete responseData.register_at;

      return res.status(200).json({
        success: true,
        data: responseData,
        token: jsontoken,
      });
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'INCORRECT_PASSWORD',
        message: 'password is incorrect',
      },
    });
  },
};
