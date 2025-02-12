# McDonald's Store Locator 🍔

An interactive web application that helps users find nearby McDonald's locations using React and Leaflet.js for the frontend, with Node.js and PostGIS-enabled PostgreSQL for spatial queries.

<img width="800" alt="image" src="https://github.com/user-attachments/assets/c87cd5aa-9d35-48bb-8e1b-37e43dedf55c" />

## ✨ Features

- 🗺️ Interactive map visualization using Leaflet.js
- 📍 Custom location search with latitude/longitude input
- 🎯 Display nearest McDonald's locations with custom markers
- 🎨 Modern, responsive UI design
- 📏 Distance-based store searching
- 🔄 Real-time map updates

## 🛠️ Tech Stack

### Frontend
- React 18
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
COPY mcdonalds_reviews(store_name, category, store_address, city, state, latitude, longitude, rating)
FROM '/path/to/mcdonalds_reviews.csv'
DELIMITER ',' CSV HEADER;

-- Convert Coordinates to Geometry
UPDATE mcdonalds_reviews
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
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
# Server will run on http://localhost:5000
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
   - 🔴 Red marker: Your selected location
   - 📍 Blue markers: McDonald's store locations

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
- Backend API runs on port 5000
- Ensure all environment variables are properly set


## ❗ Troubleshooting

- **Database Connection Issues**: Verify PostgreSQL service is running and credentials are correct
- **Map Not Loading**: Check if Leaflet CSS is properly imported
- **API Errors**: Ensure backend server is running and CORS is properly configured

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Leaflet.js for the mapping library
- PostGIS for spatial queries
- McDonald's store data from Kaggle
