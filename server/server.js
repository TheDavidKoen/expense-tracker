const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});