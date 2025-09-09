import { Router } from "express";
import { login, logout, refresh, register, me } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", me);

export default router;
