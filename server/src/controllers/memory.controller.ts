import { Request, Response } from "express";
import Memory from "../models/Memory";

export const createMemory = async (req: any, res: Response) => {
  const memory = await Memory.create({
    ...req.body,
    user: req.user.id
  });
  res.json(memory);
};

export const getMemories = async (req: any, res: Response) => {
  const memories = await Memory.find({ user: req.user.id }).sort("-createdAt");
  res.json(memories);
};

export const deleteMemory = async (req: Request, res: Response) => {
  await Memory.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};
