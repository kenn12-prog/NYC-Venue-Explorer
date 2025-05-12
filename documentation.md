# NYC Venue Explorer - Web Application Project Documentation

## 1. Project Overview

### Motivation

**What problem does this web application solve?**  
The NYC Venue Explorer provides a platform for exploring venues in New York City using multi-dimensional data analysis of check-in data. It helps users discover popular places, understand venue popularity patterns across time and space, and find locations similar to their movement patterns.

**Why is this application useful in a real-world scenario?**  
In real-world scenarios, this application is valuable for:
- Tourists planning efficient itineraries based on popularity and proximity
- Business owners seeking to understand competitive landscape and foot traffic patterns
- Urban planners analyzing population movement and venue popularity trends
- Researchers studying human mobility patterns and venue popularity correlation with time and location

### Web Application Functions

**Main functionalities:**
1. **Venue Search**: Find venues near a specific location with filtering by category and time range
2. **Popularity Recommendations**: Discover popular venue categories in an area during specific time periods with heat map visualization
3. **Similar Trajectory Analysis**: Match user-created trajectories with similar historical movement patterns
4. **Venue Recommendations**: Suggest venues based on similar users' trajectories

**High-dimensional queries:**
- **Spatial dimension**: Uses latitude, longitude, and proximity-based queries
- **Temporal dimension**: Filters by time of day to capture venue popularity patterns
- **Categorical dimension**: Segments venues by type (restaurants, entertainment, etc.)
- **Behavioral dimension**: Analyzes check-in frequency and trajectory patterns
- **Multi-user dimension**: Correlates similar movement patterns across different users

## 2. Technology Stack

### Programming Languages & Frameworks

- **Backend**: Node.js with Express.js RESTful API
- **Frontend**: React.js with Material-UI component library
- **Database**: PostgreSQL with PostGIS extension for spatial queries

### Packages & Dependencies

#### Backend Dependencies:
- **express**: Web framework for building the API server
- **pg**: PostgreSQL client for Node.js to interact with the database
- **cors**: Enable Cross-Origin Resource Sharing for API access
- **dotenv**: Load environment variables for secure configuration

#### Frontend Dependencies:
- **react**: UI library for building the user interface
- **axios**: HTTP client for making API requests to backend
- **leaflet**: Interactive map library
- **leaflet.heat**: Heat map plugin for Leaflet
- **@mui/material**: Material Design component library
- **d3-scale** and **d3-scale-chromatic**: Data visualization coloring utilities
- **react-leaflet**: React components for Leaflet maps

## 3. Setup Instructions

### Environment Setup

```bash
# Backend setup
npm install

# Frontend setup
cd client
npm install
```

### Database Configuration

**Database Schema:**
The application uses a PostgreSQL database with the PostGIS extension for spatial data handling. The main table is `foursquare_checkins` with the following structure:

```sql
CREATE TABLE foursquare_checkins (
    user_id TEXT,
    venue_id TEXT,
    latitude FLOAT,
    longitude FLOAT,
    venue_category_name TEXT,
    utc_time TIMESTAMP,
    timezone_offset INTEGER,
    geom GEOMETRY(Point, 4326)
);
```

**Spatial Index:**
```sql
CREATE INDEX idx_geom ON foursquare_checkins USING GIST(geom);
```

**Database Environment Configuration:**
Create a `.env` file in the project root:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=nyc_venues_db
DB_PORT=5432
PORT=3001
```

## 4. Code Structure

### Frontend

**Location of frontend code:** `client/`

**Key components:**
- `App.js`: Main application component with router and map
- `SearchPanel.js`: Handles venue search with distance, category, and time filtering
- `RecommendationsPanel.js`: Handles venue category recommendations and heat map
- `SimilarUsersPanel.js`: Implements trajectory creation and matching
- `VenueRecommendationsPanel.js`: Displays venue recommendations based on similar users

### Backend

**Location of backend code:** `server.js`

**Key API endpoints:**
- `GET /search`: Find nearby venues with filtering by distance, category, and time
- `GET /categories`: Get distinct venue categories
- `GET /recommendations`: Get popular venue categories with heat map points
- `POST /similar-trajectories`: Find users with similar trajectories
- `POST /recommend-venues-from-similar-users`: Get venue recommendations based on similar users

### Database Connection

The application connects to the PostgreSQL database using environment variables stored in a `.env` file. The connection is established in `server.js` using the `pg` Node.js package:

```javascript
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
```

## 5. Queries Implemented

### Query 1: Venue Search with Multi-dimensional Filtering

**Description:**
This query finds venues near a specified location with filtering by category and time ranges. It supports KNN (K-Nearest Neighbor) spatial search and time-based filtering.

**SQL Query:**
```sql
WITH time_filtered_checkins AS (
  SELECT 
    venue_id, 
    COUNT(*) AS checkin_count,
    ARRAY_AGG(TO_CHAR(utc_time + (timezone_offset || ' minutes')::INTERVAL, 'HH24:MI:SS')) AS checkin_times
  FROM foursquare_checkins
  WHERE 
    EXTRACT(HOUR FROM (utc_time + (timezone_offset || ' minutes')::interval)) * 60 + 
    EXTRACT(MINUTE FROM (utc_time + (timezone_offset || ' minutes')::interval))
    BETWEEN $1 AND $2
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
    (v.geom <-> ST_SetSRID(ST_MakePoint($3, $4), 4326)) * 111139 AS distance
  FROM foursquare_checkins v
  INNER JOIN time_filtered_checkins t ON v.venue_id = t.venue_id
  WHERE ST_DWithin(
    v.geom,
    ST_SetSRID(ST_MakePoint($3, $4), 4326),
    $5 / 111139.0
  )
  AND v.venue_category_name = $6 -- Optional category filter
  GROUP BY 
    v.venue_id, v.venue_category_name, v.latitude, v.longitude, v.geom,
    t.checkin_count, t.checkin_times
  HAVING t.checkin_count > 0
  ORDER BY distance
  LIMIT $7
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
```

**Parameter explanation:**
- `$1, $2`: Start and end time in minutes (e.g., 480 for 8:00 AM)
- `$3, $4`: Longitude and latitude of search center
- `$5`: Search radius in meters
- `$6`: Venue category (optional)
- `$7`: Number of results to return (K in KNN)

**Unexpected Value Handling:**
- Default radius is used if not specified
- Default K value is provided if missing
- Time filtering is intelligently handled for cross-day ranges
- Invalid coordinates return a 400 error with descriptive message

### Query 2: Venue Category Popularity with Heat Map Data

**Description:**
This query identifies popular venue categories in a specific area during a given time range, providing both category summaries and detailed heat map points.

**SQL Query:**
```sql
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
```

**Parameter explanation:**
- `$1, $2`: Start and end time in minutes
- `$3, $4`: Longitude and latitude of search center
- `$5`: Search radius in meters

### Query 3: Similar Trajectory Search using DTW Algorithm

**Description:**
This query extracts user trajectories from check-in data and performs trajectory similarity analysis using Dynamic Time Warping (DTW) algorithm to identify similar movement patterns.

**SQL Query (for trajectory extraction):**
```sql
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
```

**DTW Algorithm Implementation:**
The system implements a custom Dynamic Time Warping algorithm in JavaScript to compare trajectories, considering both spatial distance and time differences. The algorithm calculates a similarity score between user-defined trajectories and historical trajectories.

### Query 4: Venue Recommendations Based on Similar Users

**Description:**
This query finds common venues among a set of users with similar trajectories to provide personalized venue recommendations.

**SQL Query:**
```sql
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
```

**Parameter explanation:**
- `$1`: Array of user IDs identified as having similar trajectory patterns

## 6. How to Run the Application

```bash
# Start Backend Server (from project root)
node server.js

# Start Frontend (from another terminal)
cd client
npm start
```

The application will automatically open in your default web browser. If not, navigate to http://localhost:3000.

## 7. Port Usage

- **Backend Port**: 3001
- **Frontend Port**: 3000

## 8. UI Address

The application is accessible at http://localhost:3000

## 9. Additional Notes

### Assumptions

- The application assumes Foursquare check-in data is imported into the PostgreSQL database.
- Local time is calculated using UTC time and timezone offset values from the database.
- The application is optimized for desktop use with modern browsers supporting JavaScript ES6.

### Technical Highlights

- **Multi-dimensional spatial-temporal queries** combining location, time, and categorical data
- **Custom trajectory similarity algorithm** using Dynamic Time Warping (DTW)
- **Real-time heat map visualization** of venue popularity
- **Interactive trajectory creation** via map click interface
- **Context-aware venue recommendations** based on similar user behavior

### Acknowledgements

- Leaflet.js and react-leaflet for mapping functionality
- Material-UI for UI components
- PostgreSQL and PostGIS for spatial database capabilities
- Foursquare for the original NYC check-in dataset

This project demonstrates the powerful capabilities of spatial-temporal databases for multi-dimensional analysis of location-based service data.
