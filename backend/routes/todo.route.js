import express from "express";

import Todo from "../models/todo.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const sortOrder = req.query.sort === "asc" ? 1 : -1;

  try {
    const todo = await Todo.find().sort({ createdAt: sortOrder });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    description: req.body.description,
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found " });

    if (req.body.text !== undefined) todo.text = req.body.text;
    if (req.body.description !== undefined)
      todo.description = req.body.description;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
