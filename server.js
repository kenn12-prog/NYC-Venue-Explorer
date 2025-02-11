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

// 查询最近的 UNIQUE 坐标店铺
app.get("/search", async (req, res) => {
  let { latitude, longitude, limit } = req.query;

  // 确保转换为数值
  const parsedLat = parseFloat(latitude);
  const parsedLong = parseFloat(longitude);
  const parsedLimit = parseInt(limit);

  if (isNaN(parsedLat) || isNaN(parsedLong) || isNaN(parsedLimit)) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  console.log("Executing query with:", { parsedLat, parsedLong, parsedLimit });

  const query = `WITH nearest_shops AS (
    SELECT DISTINCT ON (geom)
        geom, 
        store_address,
        ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance
    FROM mcdonalds_reviews
    ORDER BY geom, distance
    LIMIT $3
    )
    SELECT 
      json_agg(json_build_object(
          'latitude', ST_Y(geom),
          'longitude', ST_X(geom),
          'address', store_address
      )) AS closest_shops
    FROM nearest_shops;
  `;

  // `
  //   SELECT DISTINCT ON (geom)
  //   store_name, store_address, latitude, longitude, rating, review_count,
  //   ST_Distance(ST_SetSRID(geom, 4326)::geography,ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance
  //   FROM mcdonalds_reviews
  //   WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  //   ORDER BY geom, distance LIMIT $3;
  // `;

  try {
    const { rows } = await pool.query(query, [
      parsedLat,
      parsedLong,
      parsedLimit,
    ]);
    console.log("Query results:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Database query error:", err);
    res
      .status(500)
      .json({ error: "Database query error", details: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
