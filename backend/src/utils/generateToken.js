import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );

  return token;
};

export default generateToken;
