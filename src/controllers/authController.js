import { pool } from "../db.js";
import { hashPassword } from "../utils/hash.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, mobile_number, password } = req.body;

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered",status:false });
    }

    const hashedPassword = await hashPassword(password);

    await pool.query(
      `INSERT INTO users 
       (first_name, last_name, email, mobile_number, password)
       VALUES ($1, $2, $3, $4, $5)`,
      [first_name, last_name, email, mobile_number, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully",status:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error",status:false });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials", status: false });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", status: false });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    res.status(200).json({
      status: true,
      message: "Login successful",
      accessToken: token,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", status: false });
  }
};

