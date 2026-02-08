import { pool } from "../db.js";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;

   
    const cartRes = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cartRes.rows.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cartRes.rows.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    
    const orderRes = await pool.query(
      "INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id",
      [userId, totalAmount]
    );

    const orderId = orderRes.rows[0].id;

    
    for (const item of cartRes.rows) {
      await pool.query(
        `INSERT INTO order_items 
         (order_id, product_id, name, image, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          item.product_id,
          item.name,
          item.image,
          item.price,
          item.quantity,
        ]
      );
    }

    
    await pool.query("DELETE FROM cart WHERE user_id = $1", [userId]);

    res.status(201).json({
      status: true,
      message: "Order placed successfully",
      orderId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const ordersRes = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    for (const order of ordersRes.rows) {
      const itemsRes = await pool.query(
        "SELECT * FROM order_items WHERE order_id = $1",
        [order.id]
      );
      order.items = itemsRes.rows;
    }

    res.status(200).json({
      status: true,
      orders: ordersRes.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
