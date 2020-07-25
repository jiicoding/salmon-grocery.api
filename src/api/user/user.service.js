const pool = require('../../config/database');

module.exports = {
  create: async (data) => {
    try {
      await pool.query(
        `insert into users(username, password, phone_number, email, full_name, address) values (?,?,?,?,?,?);`,
        [
          data.username,
          data.password,
          data.phone_number,
          data.email,
          data.full_name,
          data.address,
        ]
      );

      return {
        success: true,
        message: 'Create new user success',
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
  getUserByUsername: async (username) => {
    try {
      const result = await pool.query(
        `select * from users where username = ?`,
        [username]
      );
      if (!result[0].length) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND_USER',
            message: 'Username is incorrect',
          },
        };
      }
      return {
        success: true,
        data: result[0][0],
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
};
