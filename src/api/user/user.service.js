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
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
};
