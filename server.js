const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./database");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const KEY_TIMEOUT = 120000; // 120 seconds

// Get keyboard state
app.get("/keys", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM `keys`");
    if (!Array.isArray(rows)) {
      return res.status(500).json({ error: "Invalid data format" });
    }
    // console.log("Available keys are : ", rows);
    res.json(rows);
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).json({ error: err.message });
  }
});

// Acquire control
app.post("/control", async (req, res) => {
  const { user } = req.body;
  try {
    const result = await pool.query(
      //   "SELECT user_id FROM control ORDER BY acquired_at DESC LIMIT 1"
      "SELECT * from control"
    );
    const result2 = await pool.query(
      "UPDATE keys SET controlled_by = ? WHERE controlled_by IS NULL",
      [user]
    );
    console.log("Result is : ", result2);
    if (result.length > 0 && result[0].user_id) {
      return res
        .status(400)
        .json({ message: "Control is already acquired by another user." });
    }
    await pool.query("INSERT INTO control (user_id) VALUES(?)");
    res.json({ message: "Control acquired" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update key state
app.post("/toggle-key", async (req, res) => {
  const { key_number, user } = req.body;

  console.log("Key number is : ", key_number, "User is :", user);
  try {
    const [rows] = await pool.query("SELECT * FROM keys WHERE key_number = ?", [
      key_number,
    ]);
    if (rows.length > 0) {
      const currentStatus = rows[0].status;
      const newStatus =
        currentStatus === "off" ? (user === 1 ? "red" : "yellow") : "off";
      await pool.query("UPDATE keys SET status = ? WHERE key_number = ?", [
        newStatus,
        key_number,
      ]);
      res.json({ message: "Key toggled" });
    } else {
      res.status(404).json({ error: "Key not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-release control after timeout
setInterval(async () => {
  try {
    await pool.query(
      "UPDATE `keys` SET controlled_by = NULL WHERE last_updated < DATE_SUB(NOW(), INTERVAL 120 SECOND)"
    );
    console.log("Inactive keys reset");
  } catch (err) {
    console.error("Error resetting keys:", err.message);
  }
}, 5000);

app.listen(3000, () => console.log("Server running on port 3000"));
