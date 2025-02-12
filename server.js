require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get("/search", async (req, res) => {
  let { latitude, longitude, limit, days } = req.query;

  // 转换参数
  const parsedLat = parseFloat(latitude);
  const parsedLong = parseFloat(longitude);
  const parsedLimit = parseInt(limit);
  const parsedDays = parseInt(days);

  if (isNaN(parsedLat) || isNaN(parsedLong) || isNaN(parsedLimit) || isNaN(parsedDays)) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  console.log("Executing query with:", { parsedLat, parsedLong, parsedLimit, parsedDays });

  const query = `
    WITH filtered_shops AS (
      SELECT DISTINCT ON (geom)
        geom, 
        store_address,
        ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance
      FROM mcdonalds_reviews
      WHERE parsed_review_time >= NOW() - INTERVAL '${parsedDays} days'
        AND rating = '4 stars'
      ORDER BY geom, distance
      LIMIT $3
    )
    SELECT 
      json_agg(json_build_object(
          'latitude', ST_Y(geom),
          'longitude', ST_X(geom),
          'address', store_address
      )) AS closest_shops
    FROM filtered_shops;
  `;

  try {
    const { rows } = await pool.query(query, [
      parsedLat,
      parsedLong,
      parsedLimit
    ]);
    console.log("Query results:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Database query error", details: err.message });
  }
});


const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
