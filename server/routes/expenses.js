const express = require("express");
const Expense = require("../models/Expense");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        res.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/", authenticateToken, async (req, res) => {
    const { description, amount } = req.body;

    if (!description || !amount) {
        return res.status(400).json({ message: "Description and amount are required." });
    }

    try {
        const newExpense = new Expense({ user: req.user.id, description, amount });
        await newExpense.save();
        res.json(newExpense);
    } catch (error) {
        console.error("Error saving expense:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExpense = await Expense.findOneAndDelete({ _id: id, user: req.user.id });

        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(deletedExpense);
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;