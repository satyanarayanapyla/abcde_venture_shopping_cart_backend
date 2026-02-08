import { pool } from "../db.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item } = req.body;

    
    const existingItem = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [userId, item.id]
    );

    if (existingItem.rows.length > 0) {
    
      await pool.query(
        "UPDATE cart SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2",
        [userId, item.id]
      );
    } else {
      
      await pool.query(
        `INSERT INTO cart 
         (user_id, product_id, name, image, category, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          item.id,
          item.name,
          item.image,
          item.category,
          item.price,
          1,
        ]
      );
    }

    res.status(200).json({
      status: true,
      message: "Item added to cart",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
         id,
         product_id,
         name,
         image,
         category,
         price,
         quantity,
         (price * quantity) AS total_price
       FROM cart
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({
      status: true,
      items: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
