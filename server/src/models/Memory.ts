import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    mood: String,
    tags: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Memory", MemorySchema);

