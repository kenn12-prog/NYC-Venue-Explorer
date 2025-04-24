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

pool.query("SELECT current_database(), current_user", (err, res) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err);
  } else {
    console.log("✅ Connected to DB:", res.rows[0]);
  }
});

app.get("/search", async (req, res) => {
  let { latitude, longitude, radius, category } = req.query;

  const parsedLat = parseFloat(latitude);
  const parsedLong = parseFloat(longitude);
  const parsedRadius = parseFloat(radius) || 5000;
  
  if (isNaN(parsedLat) || isNaN(parsedLong)) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  console.log("Executing query with:", { parsedLat, parsedLong, parsedRadius, category });

  let query = `
    WITH nearby_venues AS (
      SELECT 
        venue_id,
        venue_category_name,
        latitude,
        longitude,
        ST_Distance(
          geom,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)
        ) * 111139 as distance
      FROM foursquare_checkins
      WHERE ST_DWithin(
        geom,
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        $3 / 111139.0
      )
  `;

  const queryParams = [parsedLong, parsedLat, parsedRadius];

  if (category) {
    query += ` AND venue_category_name = $4`;
    queryParams.push(category);
  }

  query += `
      GROUP BY venue_id, venue_category_name, latitude, longitude, geom
      ORDER BY distance
      LIMIT 50
    )
    SELECT json_agg(
      json_build_object(
        'venue_id', venue_id,
        'category', venue_category_name,
        'latitude', latitude,
        'longitude', longitude,
        'distance', ROUND(distance::numeric, 2)
      )
    ) as venues
    FROM nearby_venues;
  `;

  try {
    const { rows } = await pool.query(query, queryParams);
    console.log("Query results:", rows);
    res.json(rows[0]);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Database query error", details: err.message });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT venue_category_name
      FROM foursquare_checkins
      ORDER BY venue_category_name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Category query error:", err);
    res.status(500).json({ error: "Failed to fetch categories", details: err.message });
  }
});

// 修改时间模式分析端点
app.get("/time-patterns", async (req, res) => {
  const { dayType, timeSlot } = req.query;
  
  try {
    const query = `
      WITH parsed_times AS (
        SELECT 
          venue_id,
          venue_category_name,
          EXTRACT(DOW FROM utc_time::timestamp) as day_of_week,
          EXTRACT(HOUR FROM utc_time::timestamp) as hour_of_day
        FROM foursquare_checkins
      )
      SELECT 
        venue_category_name,
        COUNT(*) as visit_count
      FROM parsed_times
      WHERE 
        CASE 
          WHEN $1 = 'weekend' THEN day_of_week IN (0, 6)
          WHEN $1 = 'weekday' THEN day_of_week BETWEEN 1 AND 5
          ELSE TRUE
        END
        AND
        CASE 
          WHEN $2 = 'morning' THEN hour_of_day BETWEEN 6 AND 11
          WHEN $2 = 'afternoon' THEN hour_of_day BETWEEN 12 AND 17
          WHEN $2 = 'evening' THEN hour_of_day BETWEEN 18 AND 23
          WHEN $2 = 'night' THEN hour_of_day BETWEEN 0 AND 5
          ELSE TRUE
        END
      GROUP BY venue_category_name
      ORDER BY visit_count DESC
      LIMIT 10;
    `;

    const { rows } = await pool.query(query, [dayType, timeSlot]);
    res.json(rows);
  } catch (err) {
    console.error("Time pattern analysis error:", err);
    res.status(500).json({ error: "Failed to analyze time patterns", details: err.message });
  }
});

// 修改热门场所分析端点
app.get("/popular-venues", async (req, res) => {
  const { latitude, longitude, radius } = req.query;
  
  try {
    const query = `
      WITH venue_stats AS (
        SELECT 
          venue_id,
          venue_category_name,
          latitude,
          longitude,
          COUNT(*) as checkin_count,
          COUNT(DISTINCT user_id) as unique_visitors,
          ST_Distance(
            geom,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)
          ) * 111139 as distance
        FROM foursquare_checkins
        WHERE ST_DWithin(
          geom,
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          $3 / 111139.0
        )
        GROUP BY venue_id, venue_category_name, latitude, longitude, geom
      )
      SELECT 
        venue_id,
        venue_category_name,
        latitude,
        longitude,
        checkin_count,
        unique_visitors,
        ROUND(distance::numeric, 2) as distance
      FROM venue_stats
      ORDER BY checkin_count DESC
      LIMIT 20;
    `;

    const { rows } = await pool.query(query, [
      parseFloat(longitude),
      parseFloat(latitude),
      parseFloat(radius) || 5000
    ]);
    res.json(rows);
  } catch (err) {
    console.error("Popular venues analysis error:", err);
    res.status(500).json({ error: "Failed to analyze popular venues", details: err.message });
  }
});

// 修改类别趋势分析端点
app.get("/category-trends", async (req, res) => {
  try {
    const query = `
      WITH hourly_stats AS (
        SELECT 
          venue_category_name,
          EXTRACT(HOUR FROM utc_time::timestamp) as hour_of_day,
          COUNT(*) as visit_count
        FROM foursquare_checkins
        GROUP BY venue_category_name, hour_of_day
      )
      SELECT 
        venue_category_name,
        json_object_agg(
          hour_of_day::text, 
          visit_count
        ) as hourly_distribution
      FROM hourly_stats
      GROUP BY venue_category_name
      ORDER BY SUM(visit_count) DESC
      LIMIT 10;
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Category trends analysis error:", err);
    res.status(500).json({ error: "Failed to analyze category trends", details: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
