const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
});

module.exports = mongoose.model("Expense", expenseSchema);