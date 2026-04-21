const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const requestedRole = String(role || "").toLowerCase();
    const canCreateAdmin =
      requestedRole === "admin" &&
      process.env.ADMIN_SECRET &&
      adminSecret === process.env.ADMIN_SECRET;

    const user = await User.create({
      name,
      email,
      password,
      role: canCreateAdmin ? "admin" : "user"
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};
