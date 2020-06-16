const pool = require('../../config/database');

module.exports = {
  create: (data, callback) => {
    pool.query(
      `insert into Users(username, password, phone_number, email, full_name, address) values (?,?,?,?,?,?);`,
      [
        data.username,
        data.password,
        data.phone_number,
        data.email,
        data.full_name,
        data.address,
      ],
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
  getUserByUsername: (username, callback) => {
    pool.query(
      `select * from Users where username = ?`,
      [username],
      (error, results) => {
        if (error) {
          return callback({
            code: error.code,
            message: error.sqlMessage,
          });
        }
        return callback(null, results[0]);
      }
    );
  },
};
