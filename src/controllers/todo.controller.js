import Todo from "../models/Todo.js";

export async function createTodo(req, res) {
  const { title, completed } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });
  const todo = await Todo.create({ user: req.user.id, title, completed: !!completed });
  res.status(201).json(todo);
}

export async function listTodos(req, res) {
  const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(todos);
}

export async function getTodo(req, res) {
  const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
  if (!todo) return res.status(404).json({ message: "Todo not found" });
  res.json(todo);
}

export async function updateTodo(req, res) {
  const { title, completed } = req.body;
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: { ...(title !== undefined && { title }), ...(completed !== undefined && { completed }) } },
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: "Todo not found" });
  res.json(todo);
}

export async function deleteTodo(req, res) {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!todo) return res.status(404).json({ message: "Todo not found" });
  res.json({ message: "Deleted" });
}
