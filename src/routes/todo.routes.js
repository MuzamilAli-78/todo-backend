import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createTodo, deleteTodo, getTodo, listTodos, updateTodo } from "../controllers/todo.controller.js";

const router = Router();

router.use(requireAuth);
router.post("/", createTodo);
router.get("/", listTodos);
router.get("/:id", getTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
