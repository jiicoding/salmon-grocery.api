const { verify } = require('jsonwebtoken');

module.exports = {
  checkToken: (req, res, next) => {
    let token = req.get('authorization');
    if (token) {
      token = token.slice(7);
      verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Access denied! Invalid token',
            },
          });
        }
        next();
      });
    } else {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_USER',
          message: 'Access denied! unauthorized user',
        },
      });
    }
  },
  checkAdminToken: (req, res, next) => {
    let token = req.get('authorization');
    if (token) {
      token = token.slice(7);
      verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Access denied! Invalid token',
            },
          });
        }
        const { role } = decoded;
        if (role == process.env.ADMIN_ROLE) {
          next();
        } else {
          return res.status(401).json({
            success: false,
            error: {
              code: 'NO_PERMISSION',
              message: 'Access denied! no permission',
            },
          });
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_USER',
          message: 'Access denied! unauthorized user',
        },
      });
    }
  },
};
