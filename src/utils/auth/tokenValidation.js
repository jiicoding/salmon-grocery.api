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
            error: 'Invalid token',
          });
        }
        next();
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Access denied! unauthorized user',
      });
    }
  },
};
