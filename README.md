# NYC Venue Explorer

![NYC Venue Explorer](client/public/pic1.png)

## Project Overview

NYC Venue Explorer is a multi-dimensional query analysis system based on location data. It utilizes Foursquare check-in data to help users discover popular venues in New York City, understand venue popularity patterns across time and space, and provides personalized recommendations based on trajectory similarity.

### Main Features

- **Venue Search**: Find nearby venues based on distance, category, and time periods
- **Popularity Recommendations**: Discover the most popular venue categories in specific areas and time periods, visualized through heat maps
- **Trajectory Matching**: Analyze user-created movement trajectories and match them with similar patterns in historical data
- **Venue Recommendations**: Recommend potentially interesting venues based on similar users' visit history

## Technology Stack

- **Frontend**: React.js, Material-UI, Leaflet map components
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with PostGIS
- **Key Technologies**:
  - Spatial-temporal data queries
  - Dynamic Time Warping (DTW) algorithm
  - Heat map visualization
  - Responsive interface design

## System Screenshots

![Search Function](client/public/pic2.png)
![Heat Map](client/public/pic3.png)
![Trajectory Matching](client/public/pic4.png)

## Installation and Running

### Prerequisites

- Node.js (v14+)
- PostgreSQL database (with PostGIS extension)
- NPM or Yarn

### Database Configuration

1. Create PostgreSQL database and enable PostGIS extension:

```sql
CREATE DATABASE nyc_venues_db;
\c nyc_venues_db
CREATE EXTENSION postgis;
```

2. Create table structure:

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

CREATE INDEX idx_geom ON foursquare_checkins USING GIST(geom);
```

3. Import data (assuming Foursquare data is available)

### Environment Configuration

Create a `.env` file in the project root directory:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=nyc_venues_db
DB_PORT=5432
PORT=3001
```

### Installing Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

### Starting the Application

```bash
# Start backend server (from project root)
node server.js

# Start frontend development server (in another terminal)
cd client
npm start
```

The application will automatically open in your browser at: http://localhost:3000

## Core Feature Demonstrations

### Venue Search

1. Select a center location on the map
2. Set a search radius (e.g., 500 meters)
3. Choose a venue category (optional)
4. Set a time period (e.g., 9 AM to 2 PM)
5. Click the "Search" button to view results

### Popularity Recommendations

1. Select an area and time period
2. View the ranking of popular venue categories
3. Observe the heat map distribution on the map

### Trajectory Matching and Recommendations

1. Click on the map to create trajectory points
2. Select a time for each point
3. Click "Find Similar Trajectories"
4. Select similar users of interest
5. Get venue recommendations based on these users

## Project Structure

```
NYC-Venue-Explorer/
├── server.js                # Backend main program
├── package.json             # Project dependencies
├── .env                     # Environment variables
├── client/                  # Frontend code
│   ├── public/              # Static resources
│   │   └── pic1.png         # Example screenshot
│   ├── src/                 # React source code
│   │   ├── App.js           # Main application component
│   │   ├── components/      # Components directory
│   │   │   ├── SearchPanel.js           # Search panel
│   │   │   ├── RecommendationsPanel.js  # Recommendations panel
│   │   │   ├── SimilarUsersPanel.js     # Similar trajectories panel
│   │   │   ├── VenueRecommendationsPanel.js # Venue recommendations panel
│   │   │   ├── TimeRangePicker.js       # Time range picker
│   │   │   └── VenueList.js             # Venue list
│   │   └── ...
│   └── package.json         # Frontend dependencies
└── documentation.md         # Detailed documentation
```

## Technical Highlights

- **Spatial Index Optimization**: Using PostGIS spatial indices to accelerate geographical queries
- **Multi-dimensional Joint Queries**: Combining spatial, temporal, and categorical data for complex analysis
- **Dynamic Time Warping Algorithm**: Custom implementation of trajectory similarity comparison algorithm
- **Responsive Design**: User interface that adapts to different screen sizes
- **Real-time Heat Map**: Intuitive visualization of venue popularity distribution

## Multi-dimensional Data Analysis

NYC Venue Explorer demonstrates how to use multi-dimensional data queries to implement advanced analysis of location-based services:

1. **Spatial Dimension**: Nearest neighbor queries based on latitude, longitude, and distance
2. **Temporal Dimension**: Filtering venue activity by time of day
3. **Categorical Dimension**: Classification and filtering by venue type
4. **Behavioral Dimension**: Analysis of check-in frequency and trajectory patterns
5. **Multi-user Dimension**: Identifying similar users and combining their historical behavior data

## Contribution and Development

If you would like to contribute to this project:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Contact Information

Project Author - Your Name - Your Email

Project Link: [https://github.com/yourusername/NYC-Venue-Explorer](https://github.com/yourusername/NYC-Venue-Explorer)

## Acknowledgments

- Foursquare for providing the original dataset
- Leaflet.js and React-Leaflet for map functionality
- Material-UI for interface components
- PostgreSQL and PostGIS for spatial database capabilities
