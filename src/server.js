import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import "express-async-errors";

const app = express();

app.use(helmet());
app.use(morgan("dev"));

// CORS (dev note: if you use Vite proxy, these can be relaxed)
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({
  origin: "http://localhost:5173", // your frontend
  credentials: true
}));



app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/crud_auth_db";

connectDB(URI).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
