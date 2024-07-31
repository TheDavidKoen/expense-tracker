const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "your_jwt_secret"; // Replace this with a more secure secret

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(
    "mongodb+srv://dave:123451@dummycluster.qtra5ri.mongodb.net/ExpenseTracker",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

const db = mongoose.connection;

db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});
db.once("open", () => {
    console.log("Connected to MongoDB");
});

// Define User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Define Expense schema
const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Expense = mongoose.model("Expense", expenseSchema);

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Authentication routes
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// API routes
app.get("/expenses", authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        res.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/expenses", authenticateToken, async (req, res) => {
    const { description, amount } = req.body;

    try {
        if (!description || !amount) {
            return res.status(400).json({ message: "Description and amount are required." });
        }

        const newExpense = new Expense({ description, amount, user: req.user.id });
        await newExpense.save();
        res.json(newExpense);
    } catch (error) {
        console.error("Error saving expense:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.delete('/expenses/:id', authenticateToken, async (req, res) => {
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

app.put('/expenses/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { description, amount } = req.body;

    try {
        if (!description || !amount) {
            return res.status(400).json({ message: 'Description and amount are required.' });
        }

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { description, amount },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});