const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key'; // In a real app, use an environment variable

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const bearerToken = token.split(' ')[1];

  jwt.verify(bearerToken, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;
