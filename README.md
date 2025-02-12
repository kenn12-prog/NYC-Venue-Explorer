# McDonald's Store Locator 🍔

An interactive web application that helps users find nearby McDonald's locations using React and Leaflet.js for the frontend, with Node.js and PostGIS-enabled PostgreSQL for spatial and temporal queries.
<img width="800" alt="UI" src="https://github.com/user-attachments/assets/998ba2c4-f69d-4f69-9de9-13847bca1d63" />

## ✨ Features

- 🗺️ Interactive map visualization using Leaflet.js
- 📍 Custom location search with latitude/longitude input
- 🎯 Display nearest McDonald's locations with custom markers
- 🎨 Modern, responsive UI design
- 📏 Distance-based store searching
- ⌚️ Time-range selection
- 🔄 Real-time map updates

## 🛠️ Tech Stack

### Frontend
- React 
- Leaflet.js (react-leaflet)
- Axios for API calls
- Modern CSS3 with Flexbox

### Backend
- Node.js
- Express.js
- PostgreSQL with PostGIS extension
- CORS for cross-origin requests

## 🚀 Installation Guide

### 1. Database Setup

#### Install PostgreSQL and PostGIS
```bash
# check course resources for installation instructions
```

#### Create Database and Enable PostGIS
Download the McDonald's store data from Kaggle: 🔗 [https://www.kaggle.com/datasets/nelgiriyewithana/mcdonalds-store-reviews](https://www.kaggle.com/datasets/nelgiriyewithana/mcdonalds-store-reviews)   
(Make sure the rating_count values does not contain , and the csv file is encoded as UTF-8)

<img width="800" alt="image" src="https://github.com/user-attachments/assets/5825e3bf-23e5-420c-8277-7db479712569" />

```sql
CREATE DATABASE mcdonalds_db;
\c mcdonalds_db
CREATE EXTENSION postgis;

-- Create table for stores
CREATE TABLE mcdonalds_reviews (
    id SERIAL PRIMARY KEY,
    store_address TEXT,
    -- fill data with the corresponding data type
    geom GEOMETRY(Point, 4326)
);

-- Insert sample data
COPY mcdonalds_reviews(reviewer_id, store_name, category, store_address, latitude, longitude, rating_count, ...) -- all the attributes in the dataset
FROM '/path/to/mcdonalds_reviews.csv'
DELIMITER ',' CSV HEADER;

-- Convert Coordinates to Geometry
UPDATE mcdonalds_reviews
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
```

Since the temporal data here is stored in text format, we need to create an extra attribute to save the TIMESTAMP values:
```sql
-- adding new attribute to existing table
ALTER TABLE mcdonalds_reviews ADD COLUMN parsed_review_time TIMESTAMP;

-- convert text to timestamp and save it to the new attribute column (for hour, day, week, month, and year)
UPDATE mcdonalds_reviews SET parsed_review_time = NOW() - INTERVAL '1 day' * COALESCE(NULLIF(regexp_replace(review_time, '[^0-9]', '', 'g'), ''), '0')::INTEGER WHERE review_time LIKE '%day%';

UPDATE mcdonalds_reviews SET parsed_review_time = NOW() - INTERVAL '1 month' * COALESCE(NULLIF(regexp_replace(review_time, '[^0-9]', '', 'g'), ''), '0')::INTEGER WHERE review_time LIKE '%month%';

UPDATE mcdonalds_reviews SET parsed_review_time = NOW() - INTERVAL '1 year' * COALESCE(NULLIF(regexp_replace(review_time, '[^0-9]', '', 'g'), ''), '0')::INTEGER WHERE review_time LIKE '%year%';

UPDATE mcdonalds_reviews SET parsed_review_time = NOW() - INTERVAL '1 week' * COALESCE(NULLIF(regexp_replace(review_time, '[^0-9]', '', 'g'), ''), '0')::INTEGER WHERE parsed_review_time IS NULL AND review_time LIKE '%week%';

UPDATE mcdonalds_reviews SET parsed_review_time = NOW() - INTERVAL '1 hour' * COALESCE(NULLIF(regexp_replace(review_time, '[^0-9]', '', 'g'), ''), '0')::INTEGER WHERE parsed_review_time IS NULL AND review_time LIKE '%hour%';

-- check if there is any NULL values, 0 means we successfully process all timestamp values
SELECT COUNT(*) FROM mcdonalds_reviews WHERE parsed_review_time IS NULL;
```

### 2. Backend Setup

#### Clone and Install Dependencies
Download and install **Node.js** from:  
🔗 [https://nodejs.org/](https://nodejs.org/)  
```bash
git clone <repository-url>
cd <project-directory>
npm install
```

#### Configure Environment
Create `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=ur_db_password
DB_NAME=ur_db_name
DB_PORT=5432
```

#### Start the Server
```bash
node server.js
# Server will run on http://localhost:5001
```

### 3. Frontend Setup

```bash
cd client
npm install
npm start
# Application will run on http://localhost:3000
```

## 💻 Usage

1. Open the application in your browser at `http://localhost:3000`
2. Enter latitude and longitude in the search panel
3. Select the number of stores to display (5-20)
4. Click "Search" to find nearby McDonald's locations
5. View results on the interactive map:
   -  Red marker: Your selected location
   -  Blue markers: McDonald's store locations

## 🔌 API Endpoints

### GET /search
Finds nearest McDonald's locations

#### Parameters
- `latitude` (number): Search center latitude
- `longitude` (number): Search center longitude
- `limit` (number): Maximum number of results (5-20)

#### Response Example
```json
[
  {
    "closest_shops": [
      {
        "latitude": 35.2304,
        "longitude": -100.4737,
        "address": "123 Main Street"
      }
    ]
  }
]
```

## 📁 Project Structure

```
├── client/
│   ├── public/
│   ├── src/
│   │   ├── MapComponent.js    # Main map component
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Global styles
│   └── package.json
├── server.js                  # Backend server
├── package.json
└── .env                       # Environment variables
```

## 🔧 Development Notes

- PostgreSQL service must be running
- PostGIS extension must be enabled
- Frontend runs on port 3000
- Backend API runs on port 5001
- Ensure all environment variables are properly set


## ❗ Troubleshooting

- **Database Connection Issues**: Verify PostgreSQL service is running and credentials are correct
- **Map Not Loading**: Check if Leaflet CSS is properly imported
- **API Errors**: Ensure backend server is running and CORS is properly configured

## 📄 License

This project is licensed under the Apache-2.0 license - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Leaflet.js for the mapping library
- PostGIS for spatial queries
- McDonald's store data from Kaggle
