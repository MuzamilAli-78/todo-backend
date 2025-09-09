import jwt from "jsonwebtoken";

export function signAccessToken(payload, options = {}) {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES || "15m";
  return jwt.sign(payload, secret, { expiresIn, ...options });
}

export function signRefreshToken(payload, options = {}) {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES || "7d";
  return jwt.sign(payload, secret, { expiresIn, ...options });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
