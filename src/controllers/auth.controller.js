import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/generateTokens.js";

const COOKIE_NAME = "jid";

// For local dev we’ll use a Vite proxy so the site is same-origin (http://localhost:5173 -> /api -> backend).
// That means SameSite:"lax" works and no https is required.
function setRefreshCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,      // set true only behind HTTPS in production
    path: "/",          // available to all routes
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function me(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokens");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("me() error:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email and password are required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, refreshTokens: [] });

  const accessToken = signAccessToken({ sub: user._id.toString(), email, name });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    accessToken,
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email, name: user.name });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken });
}

export async function refresh(req, res) {
  console.log("cookies on /refresh:", req.cookies);
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "No refresh token" });

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: "User not found" });

  const exists = user.refreshTokens.some((t) => t.token === token);
  if (!exists) {
    user.refreshTokens = [];
    await user.save();
    return res.status(401).json({ message: "Refresh token reuse detected" });
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
  const newRefresh = signRefreshToken({ sub: user._id.toString() });
  user.refreshTokens.push({ token: newRefresh });
  await user.save();

  setRefreshCookie(res, newRefresh);
  const newAccess = signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
  });

  res.json({ accessToken: newAccess });
}

export async function logout(req, res) {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await User.findById(payload.sub);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
        await user.save();
      }
    } catch {}
  }
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ message: "Logged out" });
}
