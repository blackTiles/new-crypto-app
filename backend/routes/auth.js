// backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const validateToken = (req, res, next) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "User not authenticated" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token verification failed" });
  }
};

router.post("/validate-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.json(false);

    const verified = jwt.verify(token, JWT_SECRET);
    if (!verified) return res.status(400).json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.status(400).json(false);

    return res.status(200).json({
        id: user._id,
        username: user.username,
        success: true,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    const newUser = await User.create({ username, email, password });
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token });

    // return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(400).json({ error: "Error registering user" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ error: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ error: "Invalid email or password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token });
});

module.exports = router;
