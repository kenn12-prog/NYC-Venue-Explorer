# NYC Venue Explorer 🗽

An interactive web application that helps users explore popular venues in New York City using React and Leaflet.js for the frontend, with Node.js and PostGIS-enabled PostgreSQL for spatial and temporal analysis of Foursquare check-in data.

<img width="800" alt="UI Screenshot" src="https://github.com/user-attachments/assets/998ba2c4-f69d-4f69-9de9-13847bca1d63" />

## ✨ Features

- 🗺️ Interactive map visualization using Leaflet.js
- 📍 Custom location search with latitude/longitude input
- 🎯 Display nearby venues with category filtering
- 🎨 Modern, responsive UI design
- 📏 Distance-based venue searching
- 📊 Popular venue analysis
- ⏰ Time-based venue popularity patterns
- 👥 Unique visitor statistics

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

## 📊 Dataset

This application uses the Foursquare check-in dataset collected from April 2012 to February 2013 in New York City. The dataset includes:

- 227,428 check-ins in New York City
- Venue categories and locations
- Temporal check-in patterns
- User anonymized data

Dataset features:
- User ID (anonymized)
- Venue ID (Foursquare)
- Venue category ID and name
- Latitude and Longitude
- Timezone offset
- UTC timestamp

## 🚀 Installation Guide

### 1. Database Setup

#### Install PostgreSQL and PostGIS
```bash
# For MacOS
brew install postgresql
brew install postgis

# For Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo apt-get install postgis
```

#### Create Database and Enable PostGIS
```sql
CREATE DATABASE nyc_venues;
\c nyc_venues
CREATE EXTENSION postgis;

-- Create table for venues
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

-- Import data
COPY foursquare_checkins(user_id, venue_id, venue_category_id, venue_category_name, latitude, longitude, timezone_offset, utc_time)
FROM '/path/to/dataset_TSMC2014_NYC.txt'
DELIMITER '\t' CSV HEADER;

-- Create spatial index
UPDATE foursquare_checkins
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
CREATE INDEX idx_foursquare_geom ON foursquare_checkins USING GIST(geom);
```

### 2. Backend Setup

#### Clone and Install Dependencies
```bash
git clone <repository-url>
cd <project-directory>
npm install
```

#### Configure Environment
Create `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=nyc_venues
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
2. Enter latitude and longitude coordinates (defaults to NYC center)
3. Set your desired search radius (in meters)
4. Optionally select a specific venue category
5. Click "Search Venues" to find nearby locations
6. View results on the interactive map:
   - Red marker: Your selected location
   - Blue markers: Nearby venues
   - Popup information includes venue category and distance

## 🔌 API Endpoints

### GET /search
Finds nearby venues within the specified radius

#### Parameters
- `latitude` (number): Search center latitude
- `longitude` (number): Search center longitude
- `radius` (number): Search radius in meters
- `category` (string, optional): Specific venue category to filter

### GET /time-patterns
Analyzes venue popularity by time periods

#### Parameters
- `dayType` (string): 'weekend' or 'weekday'
- `timeSlot` (string): 'morning', 'afternoon', 'evening', or 'night'

### GET /popular-venues
Lists most popular venues in an area

#### Parameters
- `latitude` (number): Center latitude
- `longitude` (number): Center longitude
- `radius` (number): Search radius in meters

## 📁 Project Structure

```
├── client/
│   ├── public/
│   ├── src/
│   │   ├── MapComponent.js    # Main map component
│   │   ├── App.js            # Root component
│   │   └── index.js          # Entry point
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
- **No Results**: Verify the coordinates are within NYC area and the search radius is appropriate

## 📄 License

This project is licensed under the Apache-2.0 license - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Dataset from: Yang, D., Zhang, D., Zheng, V. W., & Yu, Z. (2015). Modeling User Activity Preference by Leveraging User Spatial Temporal Characteristics in LBSNs. IEEE Trans. on Systems, Man, and Cybernetics: Systems, 45(1), 129-142.
- Leaflet.js for the mapping library
- PostGIS for spatial queries
- Foursquare for the original check-in data
