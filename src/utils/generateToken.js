import jwt from "jsonwebtoken";

export const generateToken = async (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );

  return { accessToken, refreshToken };
};
