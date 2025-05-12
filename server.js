require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// 配置 CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 添加路由日志中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

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
  let { latitude, longitude, radius, category, startTime, endTime, k } = req.query;

  const parsedLat = parseFloat(latitude);
  const parsedLong = parseFloat(longitude);
  const parsedRadius = parseFloat(radius) || 5000;
  const parsedK = parseInt(k) || 2;  // 
  
  if (isNaN(parsedLat) || isNaN(parsedLong)) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  console.log("Executing query with:", { parsedLat, parsedLong, parsedRadius, category, startTime, endTime, k: parsedK });

  let query = `
    WITH time_filtered_checkins AS (
      SELECT 
        venue_id, 
        COUNT(*) AS checkin_count,
        ARRAY_AGG(TO_CHAR(utc_time + (timezone_offset || ' minutes')::INTERVAL, 'HH24:MI:SS')) AS checkin_times
      FROM foursquare_checkins
      WHERE 1=1
  `;

  if (startTime && endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (endTotalMinutes > startTotalMinutes) {
      query += ` AND (
        EXTRACT(HOUR FROM (utc_time + (timezone_offset || ' minutes')::interval)) * 60 + 
        EXTRACT(MINUTE FROM (utc_time + (timezone_offset || ' minutes')::interval))
      ) BETWEEN ${startTotalMinutes} AND ${endTotalMinutes}`;
    } else {
      query += ` AND (
        (EXTRACT(HOUR FROM (utc_time + (timezone_offset || ' minutes')::interval)) * 60 + 
        EXTRACT(MINUTE FROM (utc_time + (timezone_offset || ' minutes')::interval))) >= ${startTotalMinutes} 
        OR
        (EXTRACT(HOUR FROM (utc_time + (timezone_offset || ' minutes')::interval)) * 60 + 
        EXTRACT(MINUTE FROM (utc_time + (timezone_offset || ' minutes')::interval))) <= ${endTotalMinutes}
      )`;
    }
  }

  query += `
      GROUP BY venue_id
    ),
    nearby_venues AS (
      SELECT 
        v.venue_id,
        v.venue_category_name,
        v.latitude,
        v.longitude,
        t.checkin_count,
        t.checkin_times,
        (v.geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)) * 111139 AS distance

      FROM foursquare_checkins v
      INNER JOIN time_filtered_checkins t ON v.venue_id = t.venue_id
      WHERE ST_DWithin(
        v.geom,
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        $3 / 111139.0
      )
  `;

  const queryParams = [parsedLong, parsedLat, parsedRadius];

  if (category) {
    query += ` AND v.venue_category_name = $${queryParams.length + 1}`;
    queryParams.push(category);
  }

  query += `
      GROUP BY 
        v.venue_id, v.venue_category_name, v.latitude, v.longitude, v.geom,
        t.checkin_count, t.checkin_times
      HAVING t.checkin_count > 0
      ORDER BY distance
      LIMIT $${queryParams.length + 1}
    )
    SELECT 
      venue_id,
      venue_category_name,
      latitude,
      longitude,
      ROUND(distance::numeric, 2) as distance,
      checkin_count,
      checkin_times
    FROM nearby_venues;
  `;

  queryParams.push(parsedK);

  try {
    const { rows } = await pool.query(query, queryParams);
    console.log("Query results:", rows);
    
    // 格式化输出结果
    const formattedResults = {
      total_venues: rows.length,
      venues: rows.map(venue => ({
        venue_id: venue.venue_id,
        category: venue.venue_category_name,
        location: {
          latitude: venue.latitude,
          longitude: venue.longitude
        },
        distance: venue.distance,
        checkins: {
          count: venue.checkin_count,
          times: venue.checkin_times
        }
      }))
    };
    
    res.json(formattedResults);
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
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Query 2: 热度+时间段的场所推荐
app.get("/recommendations", async (req, res) => {
  const { latitude, longitude, radius, startTime, endTime } = req.query;
  
  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    const query = `
      WITH time_filtered_checkins AS (
        SELECT 
          venue_id,
          venue_category_name,
          latitude,
          longitude,
          COUNT(*) as checkin_count
        FROM foursquare_checkins
        WHERE 
          EXTRACT(HOUR FROM (utc_time + (timezone_offset || ' minutes')::interval)) * 60 + 
          EXTRACT(MINUTE FROM (utc_time + (timezone_offset || ' minutes')::interval))
          BETWEEN $1 AND $2
          AND ST_DWithin(
            geom,
            ST_SetSRID(ST_MakePoint($3, $4), 4326),
            $5 / 111139.0
          )
        GROUP BY venue_id, venue_category_name, latitude, longitude
      )
      SELECT 
        venue_category_name,
        SUM(checkin_count) as total_checkins,
        COUNT(DISTINCT venue_id) as venue_count,
        json_agg(
          json_build_object(
            'lat', latitude,
            'lng', longitude,
            'count', checkin_count
          )
        ) as heatmap_points
      FROM time_filtered_checkins
      GROUP BY venue_category_name
      ORDER BY total_checkins DESC
      LIMIT 10;
    `;

    const { rows } = await pool.query(query, [
      startTotalMinutes,
      endTotalMinutes,
      parseFloat(longitude),
      parseFloat(latitude),
      parseFloat(radius)
    ]);

    res.json(rows);
  } catch (err) {
    console.error("Error in recommendations query:", err);
    res.status(500).json({ error: "Database query error" });
  }
});

// DTW算法实现
function calculateDTWSimilarity(trajectory1, trajectory2) {
  const n = trajectory1.length;
  const m = trajectory2.length;
  
  const dtw = Array(n + 1).fill().map(() => Array(m + 1).fill(Infinity));
  dtw[0][0] = 0;
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = calculatePointDistance(trajectory1[i-1], trajectory2[j-1]);
      dtw[i][j] = cost + Math.min(
        dtw[i-1][j],   
        dtw[i][j-1],    
        dtw[i-1][j-1]  
      );
    }
  }
  
  const path = [];
  let i = n, j = m;
  while (i > 0 && j > 0) {
    path.unshift([i-1, j-1]);
    const min = Math.min(dtw[i-1][j], dtw[i][j-1], dtw[i-1][j-1]);
    if (min === dtw[i-1][j-1]) {
      i--; j--;
    } else if (min === dtw[i-1][j]) {
      i--;
    } else {
      j--;
    }
  }
  
  const maxLength = Math.max(n, m);
  const similarity = 1 / (1 + dtw[n][m] / maxLength);
  
  return {
    similarity,
    path,
    distance: dtw[n][m]
  };
}

function calculatePointDistance(point1, point2) {

  const spatialDistance = Math.sqrt(
    Math.pow(point1.latitude - point2.latitude, 2) +
    Math.pow(point1.longitude - point2.longitude, 2)
  );

  const timeDistance = Math.abs(point1.hour - point2.hour) / 24;
  
  return spatialDistance + timeDistance;
}

// query3:修改相似轨迹查询端点
app.post("/similar-trajectories", async (req, res) => {
  console.log('Received request at /similar-trajectories');
  const { trajectory } = req.body;
  
  console.log('Received trajectory:', trajectory);
  
  if (!Array.isArray(trajectory) || trajectory.length === 0) {
    console.log('Invalid trajectory data');
    return res.status(400).json({ error: "Invalid trajectory data" });
  }

  try {
    // 获取所有用户的轨迹
    const allUsersQuery = `
      WITH user_trajectories AS (
        SELECT 
          user_id,
          array_agg(
            json_build_object(
              'latitude', latitude,
              'longitude', longitude,
              'hour', EXTRACT(HOUR FROM (utc_time + (timezone_offset || ' minutes')::interval))
            ) ORDER BY utc_time
          ) as trajectory
        FROM foursquare_checkins
        GROUP BY user_id
        HAVING array_length(array_agg(venue_id), 1) >= 2
      )
      SELECT 
        user_id,
        trajectory
      FROM user_trajectories;
    `;

    console.log('Executing database query...');
    const allUsers = await pool.query(allUsersQuery);
    console.log('Found users with trajectories:', allUsers.rows.length);
    
    if (allUsers.rows.length === 0) {
      console.log('No users found in database');
      return res.json([]);
    }

    const similarUsers = allUsers.rows.map(user => {
      console.log('Calculating similarity for user:', user.user_id);
      console.log('User trajectory length:', user.trajectory.length);
      
      const dtwResult = calculateDTWSimilarity(
        trajectory,
        user.trajectory
      );
      
      return {
        userId: user.user_id,
        similarity: dtwResult.similarity,
        distance: dtwResult.distance,
        trajectory: user.trajectory,
        matchingPath: dtwResult.path
      };
    });

    // 按相似度降序排序
    similarUsers.sort((a, b) => b.similarity - a.similarity);
    console.log('Similar users found:', similarUsers.length);

    // 返回前10个最相似的用户
    const topSimilarUsers = similarUsers.slice(0, 10);
    console.log('Top similar users:', topSimilarUsers.length);
    
    res.json(topSimilarUsers);
  } catch (err) {
    console.error("Error in similar trajectories query:", err);
    res.status(500).json({ error: "Database query error", details: err.message });
  }
});

// 基于相似用户推荐场所端点
app.post("/recommend-venues-from-similar-users", async (req, res) => {
  console.log('Received request at /recommend-venues-from-similar-users');
  const { userIds } = req.body;
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    console.log('Invalid user IDs data');
    return res.status(400).json({ error: "Invalid user IDs" });
  }

  try {
    // 获取这些用户访问过的共同场所
    const commonVenuesQuery = `
      WITH similar_users_venues AS (
        SELECT 
          venue_id, 
          venue_category_name, 
          latitude, 
          longitude,
          COUNT(DISTINCT user_id) as user_count,
          COUNT(*) as visit_count
        FROM 
          foursquare_checkins
        WHERE 
          user_id = ANY($1)
        GROUP BY 
          venue_id, venue_category_name, latitude, longitude
        ORDER BY 
          user_count DESC, visit_count DESC
        LIMIT 15
      )
      SELECT 
        venue_id,
        venue_category_name as category,
        latitude,
        longitude,
        user_count,
        visit_count
      FROM 
        similar_users_venues
      ORDER BY 
        user_count DESC, visit_count DESC;
    `;

    console.log('Executing venue recommendation query...');
    const { rows } = await pool.query(commonVenuesQuery, [userIds]);
    console.log('Found recommended venues:', rows.length);
    
    res.json(rows);
  } catch (err) {
    console.error("Error in venue recommendation query:", err);
    res.status(500).json({ error: "Database query error", details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});