const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// database connect
connectDB();

// middlewares
app.use(cors());
app.use(express.json());


// test route
app.get("/", (req, res) => {
  res.send("Backend is up and running");
});


// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


// transaction routes
app.use("/api/transactions", transactionRoutes);


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Server started on port " + port);
});