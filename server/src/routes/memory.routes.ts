import { Router } from "express";
import { auth } from "../middleware/auth";
import { createMemory, getMemories, deleteMemory } from "../controllers/memory.controller";

const router = Router();
router.use(auth);
router.get("/", getMemories);
router.post("/", createMemory);
router.delete("/:id", deleteMemory);
export default router;
