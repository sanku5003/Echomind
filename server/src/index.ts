import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

dotenv.config();
connectDB();
const app = express();
app.use(cors({origin : "*"}));
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes").default);
app.use("/api/memories", require("./routes/memory.routes").default);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
