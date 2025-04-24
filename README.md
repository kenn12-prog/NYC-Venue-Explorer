# Web Application Project Documentation

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

### Spatial Search
- **Task**: Find venues within a specified radius
- **Query**:
  ```sql
  WITH nearby_venues AS (
    SELECT 
      venue_id, venue_category_name,
      ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) * 111139 as distance
    FROM foursquare_checkins
    WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
  )
  SELECT * FROM nearby_venues ORDER BY distance;
  ```
- **Error Handling**: Returns empty array if no venues found

### Temporal Analysis
- **Task**: Analyze venue popularity by time periods
- **Query**:
  ```sql
  WITH time_slots AS (
    SELECT 
      venue_id,
      CASE WHEN EXTRACT(DOW FROM utc_time) IN (0, 6) THEN 'weekend'
           ELSE 'weekday' END as day_type,
      CASE WHEN EXTRACT(HOUR FROM utc_time) BETWEEN 6 AND 11 THEN 'morning'
           WHEN EXTRACT(HOUR FROM utc_time) BETWEEN 12 AND 17 THEN 'afternoon'
           WHEN EXTRACT(HOUR FROM utc_time) BETWEEN 18 AND 23 THEN 'evening'
           ELSE 'night' END as time_slot
    FROM foursquare_checkins
  )
  SELECT day_type, time_slot, COUNT(*) as visits
  FROM time_slots
  GROUP BY day_type, time_slot;
  ```

### Popular Venues
- **Task**: Identify most visited venues
- **Query**:
  ```sql
  SELECT 
    venue_id, venue_category_name,
    COUNT(*) as checkin_count,
    COUNT(DISTINCT user_id) as unique_visitors
  FROM foursquare_checkins
  GROUP BY venue_id, venue_category_name
  ORDER BY checkin_count DESC;
  ```

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
