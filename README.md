# Map Visualization Project

This project is a full-stack web application for visualizing nearby McDonald's locations using Leaflet.js for mapping and PostgreSQL/PostGIS for geospatial queries.

## Features
- Search for the **nearest McDonald's stores** based on latitude/longitude.
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

### 2. Install Dependencies
```sh
npm install
```


# **Step 1: Install Node.js and npm**
## **1.1 Install Node.js**
Download and install **Node.js LTS** from:  
🔗 [https://nodejs.org/](https://nodejs.org/)  

**Verify installation:**  
```sh
node -v
npm -v
```
If both commands return version numbers, Node.js and npm are installed.

---

# **Step 2: Install PostgreSQL and PostGIS**
## **2.1 Install PostgreSQL**
Download **PostgreSQL** from:  
🔗 [https://www.postgresql.org/download/](https://www.postgresql.org/download/)  

During installation, **enable Stack Builder** and **select PostGIS** to install.

## **2.2 Start PostgreSQL Service**
Open **Command Prompt** and run:
```sh
net start postgresql
```
or on Linux/macOS:
```sh
sudo systemctl start postgresql
```

## **2.3 Create Database and Enable PostGIS**
Open **psql**:
```sh
psql -U postgres
```
Create a new database:
```sql
CREATE DATABASE mcdonalds_db;
```
Switch to the database:
```sh
\c mcdonalds_db;
```
Enable **PostGIS**:
```sql
CREATE EXTENSION postgis;
```

---

# **Step 3: Set Up the Database Table**
## **3.1 Create Table for McDonald's Stores**
```sql
CREATE TABLE mcdonalds_reviews (
    id SERIAL PRIMARY KEY,
    store_name TEXT,
    category TEXT,
    store_address TEXT,
    city TEXT,
    state TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating TEXT,
    geom GEOMETRY(Point, 4326)
);
```

## **3.2 Import CSV Data**
For a **CSV file** with McDonald's locations, run:
```sql
COPY mcdonalds_reviews(store_name, category, store_address, city, state, latitude, longitude, rating)
FROM '/path/to/mcdonalds_reviews.csv'
DELIMITER ',' CSV HEADER;
```

## **3.3 Convert Coordinates to Geometry**
```sql
UPDATE mcdonalds_reviews 
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
```

---


## **4.3 Create `.env` File for Database Connection**
```sh
touch .env
```
Edit `.env` and add:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=mcdonalds_db
DB_PORT=5432
```

## **4.5 Start the Server**
```sh
node server.js
```
If successful, it will log:  
```sh
Server running on port 5000
```

---

# **Step 5: Set Up Frontend (React + Leaflet.js)**
## **5.1 React App**
```
cd client
```

## **5.2 Install Dependencies**
```sh
npm install react-leaflet leaflet axios
```

## **5.3 `MapComponent.js`**

You can edit `MapComponent.js`

## **5.4 Run the Frontend**
```sh
npm start
```

---

### **Final Steps**
✅ **Backend:** PostgreSQL + PostGIS, running on `localhost:5000`  
✅ **Frontend:** React + Leaflet.js, running on `localhost:3000`  
✅ **User enters location → Finds McDonald's stores → Map updates dynamically**  



## Troubleshooting
- Ensure PostgreSQL and PostGIS are installed and running.
- Verify `.env` file contains correct database credentials.
- Run `npm install` to ensure all dependencies are installed.

## License
This project is open-source under the Apache-2.0 license.

