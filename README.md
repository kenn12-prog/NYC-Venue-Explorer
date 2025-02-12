## Map Visualization Project

This project is a full-stack web application for visualizing nearby McDonald's locations using **Leaflet.js** for mapping and **PostgreSQL/PostGIS** for geospatial queries.

## Features
- Search for the **nearest McDonald's stores** based on latitude and longitude.
- Display stores on an **interactive map** using Leaflet.js.
- Perform **spatial queries** with PostGIS to find the closest stores.
- Store **geospatial data** in PostgreSQL with PostGIS extensions.

## Tech Stack
- **Frontend:** React, Leaflet.js
- **Backend:** Node.js, Express.js, PostgreSQL, PostGIS
- **Database:** PostgreSQL with PostGIS extension

## Setup Instructions

### 1. Clone the Repository
```sh
git clone <repository-url>
cd map_viz
```

### 2. Install PostgreSQL and PostGIS
Follow the course material to install PostgreSQL and PostGIS.

#### 2.1 Create Database and Enable PostGIS
```sql
CREATE DATABASE mcdonalds_db;
\c mcdonalds_db;
CREATE EXTENSION postgis;
```

#### 2.2 Create Table for McDonald's Stores
<img width="800" alt="image" src="https://github.com/user-attachments/assets/5825e3bf-23e5-420c-8277-7db479712569" />

#### 2.3 Import CSV Data
For a **CSV file** containing McDonald's locations, run:
```sql
COPY mcdonalds_reviews(store_name, category, store_address, city, state, latitude, longitude, rating)
FROM '/path/to/mcdonalds_reviews.csv'
DELIMITER ',' CSV HEADER;
```

#### 2.4 Convert Coordinates to Geometry
```sql
UPDATE mcdonalds_reviews
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
```

---

### 3. Install Node.js and npm

#### 3.1 Install Node.js
Download and install **Node.js** from:  
🔗 [https://nodejs.org/](https://nodejs.org/)  

**Verify installation:**  
```sh
node -v
npm -v
```
If both commands return version numbers, Node.js and npm are installed.

#### 3.2 Install Dependencies
```sh
npm install
```

#### 3.3 Modify `.env` File for Database Connection
Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=mcdonalds_db
DB_PORT=5432
```

#### 3.4 Start the Server
```sh
node server.js
```
If successful, it will log:
```sh
Server running on port 5000
```

---

### 4. Set Up Frontend (React + Leaflet.js)
```sh
cd client
npm start
```

Modify `client/src/MapComponent.js` for frontend customization.

---

### Final Steps
✅ **Backend:** PostgreSQL + PostGIS, running on `localhost:5000`  
✅ **Frontend:** React + Leaflet.js, running on `localhost:3000`  
✅ **User enters location → Finds McDonald's stores → Map updates dynamically**  

## Troubleshooting
- Ensure PostgreSQL and PostGIS are installed and running.
- Verify the `.env` file contains correct database credentials.
- Run `npm install` to ensure all dependencies are installed.

## License
This project is open-source under the **Apache-2.0** license.

