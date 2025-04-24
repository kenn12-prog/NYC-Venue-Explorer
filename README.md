# 

## 1. Project Overview

### Motivation
- **Problem Solved**: NYC Venue Explorer addresses the challenge of efficiently discovering and analyzing venue patterns in New York City, helping users make data-driven decisions about venue visits.

- **Real-world Applications**:
  - Tourists can plan optimal visit times to popular locations
  - Business owners can analyze competitor patterns
  - Urban planners can study city dynamics
  - Event organizers can select venues based on popularity

### Web Application Functions
- Interactive map-based venue exploration using Leaflet.js
- High-dimensional spatial queries combining location, time, and categories
- Real-time visualization of venue patterns
- Advanced analytics including:
  - Temporal popularity patterns
  - Category-based trend analysis
  - Visitor count statistics

<img width="800" alt="UI Screenshot" src="client/public/pic1.png" />

## 2. Technology Stack

### Programming Languages & Frameworks
- **Backend**: Node.js with Express.js
- **Frontend**: React.js with Leaflet.js
- **Database**: PostgreSQL with PostGIS extension

### Packages & Dependencies
- **Backend Packages**:
  ```json
  {
    "express": "^4.17.1",
    "pg": "^8.7.1",
    "cors": "^2.8.5",
    "dotenv": "^10.0.0"
  }
  ```

- **Frontend Packages**:
  ```json
  {
    "react": "^17.0.2",
    "react-leaflet": "^3.2.0",
    "axios": "^0.24.0",
    "react-icons": "^4.3.1"
  }
  ```

## 3. Setup Instructions

### Environment Setup
```bash
# Install PostgreSQL and PostGIS
brew install postgresql postgis  # MacOS
sudo apt-get install postgresql postgresql-contrib postgis  # Ubuntu

# Install Node.js dependencies
npm install
```

### Database Configuration
- **Database Schema**:
  ```sql
  CREATE DATABASE nyc_venues;
  \c nyc_venues
  CREATE EXTENSION postgis;

  CREATE TABLE foursquare_checkins (
      user_id TEXT,
      venue_id TEXT,
      venue_category_id TEXT,
      venue_category_name TEXT,
      latitude FLOAT,
      longitude FLOAT,
      timezone_offset INTEGER,
      utc_time TIMESTAMP,
      geom GEOMETRY(Point, 4326)
  );
  ```

- **Data Loading**:
  ```sql
  -- Import from TSV file
  COPY foursquare_checkins(
      user_id, venue_id, venue_category_id,
      venue_category_name, latitude, longitude,
      timezone_offset, utc_time
  ) FROM '/path/to/dataset_TSMC2014_NYC.txt'
  DELIMITER '\t' CSV HEADER;

  -- Create spatial geometry
  UPDATE foursquare_checkins
  SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
  CREATE INDEX idx_foursquare_geom ON foursquare_checkins USING GIST(geom);
  ```

## 4. Code Structure

### Frontend
- Location: `client/src/`
  - `App.js`: Main application component
  - `MapComponent.js`: Interactive map with venue markers
  - `components/`: UI components for data visualization

### Backend
- Location: `server.js`
- Key endpoints:
  ```javascript
  app.get('/search', (req, res) => {...})       // Spatial search
  app.get('/time-patterns', (req, res) => {...}) // Temporal analysis
  app.get('/popular-venues', (req, res) => {...}) // Popularity metrics
  ```

### Database Connection
- Location: `.env`
  ```bash
  DB_HOST=localhost
  DB_USER=postgres
  DB_PASSWORD=your_password
  DB_NAME=nyc_venues
  DB_PORT=5432
  ```

## 5. Queries Implemented

### Query 1: Spatial Search
- **Task Description**: Find venues within a specified radius of a given location, with optional category filtering
- **Real-world Application**: Helps users discover nearby venues based on their current location and interests

### Query 1: SQL Query
```sql
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
  AND venue_category_name = $4  -- Optional category filter
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
```
- **Variables**:
  - `$1`: Longitude of search center
  - `$2`: Latitude of search center
  - `$3`: Search radius in meters
  - `$4`: Optional venue category name

### Query 1: Unexpected Value Handling
- Invalid coordinates return 400 status with error message
- Missing radius defaults to 5000 meters
- Empty category returns all venues
- No venues found returns empty array

### Query 2: Time Pattern Analysis
- **Task Description**: Analyze venue popularity patterns based on day type (weekday/weekend) and time slots
- **Real-world Application**: Helps businesses and visitors understand peak visiting hours and optimal timing

### Query 2: SQL Query
```sql
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
```
- **Variables**:
  - `$1`: Day type filter ('weekend', 'weekday', or any)
  - `$2`: Time slot filter ('morning', 'afternoon', 'evening', 'night', or any)

### Query 2: Unexpected Value Handling
- Invalid day type or time slot defaults to showing all data
- Returns top 10 categories by visit count
- Empty result set returns empty array

### Query 3: Popular Venues Analysis
- **Task Description**: Identify the most popular venues within a given area based on check-in counts and unique visitors
- **Real-world Application**: Helps identify trending locations and analyze venue performance

### Query 3: SQL Query
```sql
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
```
- **Variables**:
  - `$1`: Longitude of search center
  - `$2`: Latitude of search center
  - `$3`: Search radius in meters (defaults to 5000)

### Query 3: Unexpected Value Handling
- Invalid coordinates or radius return error message
- Missing radius defaults to 5000 meters
- Returns top 20 venues by check-in count
- Empty result set returns empty array

### Query 4: Category Trends Analysis
- **Task Description**: Analyze hourly visit patterns for different venue categories
- **Real-world Application**: Helps understand peak hours for different types of venues

### Query 4: SQL Query
```sql
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
```
- **Variables**: None (analyzes all data)

### Query 4: Unexpected Value Handling
- Returns top 10 categories by total visit count
- Hourly distribution is aggregated as a JSON object
- Empty result set returns empty array

## 6. How to Run the Application

```bash
# Start Backend Server
node server.js

# Start Frontend (in a new terminal)
cd client
npm start
```

Additional steps:
1. Ensure PostgreSQL service is running
2. Verify database connection in `.env`
3. Check console for any startup errors

## 7. Port Usage
- Backend API: http://localhost:5001
- Frontend UI: http://localhost:3000

## 8. UI Address
Access the application at [http://localhost:3000](http://localhost:3000)

## 9. Additional Notes

### Assumptions
- Dataset is pre-loaded in PostgreSQL
- PostGIS extension is available
- Node.js v14+ is installed

### External Resources
- **Dataset**: Yang et al. (2015) IEEE Trans. SMC
- **Libraries**:
  - Leaflet.js for mapping
  - PostGIS for spatial queries
- **Data Source**: Foursquare check-ins (2012-2013)

---
### Note
This project uses GPT-powered tools for development assistance while maintaining code quality and originality.
