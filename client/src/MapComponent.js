import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Paper } from '@mui/material';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const homeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const venueIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const FixMap = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 500);
    }, [map]);
    return null;
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const SearchPanel = ({ latitude, setLatitude, longitude, setLongitude, radius, setRadius, category, setCategory, categories, searchVenues, startTime, setStartTime, endTime, setEndTime }) => {
    return (
        <div style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            zIndex: 1000,
            width: "320px",
            padding: "25px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            border: "1px solid rgba(255, 255, 255, 0.18)"
        }}>
            <div style={{
                backgroundColor: "#2C3E50",
                margin: "-25px -25px 20px -25px",
                padding: "20px",
                borderRadius: "20px 20px 0 0",
                textAlign: "center",
                boxShadow: "0 4px 15px rgba(44, 62, 80, 0.2)"
            }}>
                <h2 style={{ 
                    color: "white", 
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                }}>
                    <span style={{ fontSize: "24px" }}>🗽</span>
                    NYC Venue Explorer
                </h2>
                <div style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "14px",
                    marginTop: "5px"
                }}>
                    Discover Popular Places in New York
                </div>
            </div>

            <div className="input-group">
                <label style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#4a4a4a",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>Latitude:</label>
                <input 
                    type="text" 
                    value={latitude} 
                    onChange={(e) => setLatitude(e.target.value)}
                    style={{
                        padding: "10px 14px",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "14px",
                        width: "calc(100% - 32px)",
                        backgroundColor: "#f8f9fa",
                        transition: "all 0.3s ease",
                        outline: "none"
          }}
                    onFocus={(e) => e.target.style.borderColor = "#4A90E2"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
            </div>
            
            <div className="input-group">
                <label style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#4a4a4a",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>Longitude:</label>
                <input 
                    type="text" 
                    value={longitude} 
                    onChange={(e) => setLongitude(e.target.value)}
                    style={{
                        padding: "10px 14px",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "14px",
                        width: "calc(100% - 32px)",
                        backgroundColor: "#f8f9fa",
                        transition: "all 0.3s ease",
                        outline: "none"
          }}
                    onFocus={(e) => e.target.style.borderColor = "#4A90E2"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
            </div>
            
            <div className="input-group">
                <label style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#4a4a4a",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>Search Radius (meters):</label>
                <input 
                    type="number" 
                    value={radius} 
                    onChange={(e) => setRadius(e.target.value)}
                    style={{
                        padding: "10px 14px",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "14px",
                        width: "calc(100% - 32px)",
                        backgroundColor: "#f8f9fa",
                        transition: "all 0.3s ease",
                        outline: "none"
          }}
                    onFocus={(e) => e.target.style.borderColor = "#4A90E2"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
            </div>

            <div className="input-group">
                <label style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#4a4a4a",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>Venue Category:</label>
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                        padding: "10px 14px",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "14px",
                        width: "100%",
                        backgroundColor: "#f8f9fa",
                        transition: "all 0.3s ease",
                        outline: "none",
                        cursor: "pointer",
                        appearance: "none"
                    }}
                >
                    <option value="">All Categories</option>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat.venue_category_name}>
                            {cat.venue_category_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <label style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#4a4a4a",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>Time Range:</label>
                <div style={{ 
                    display: "flex", 
                    gap: "12px",
                    alignItems: "center",
                    justifyContent: "flex-start"
                }}>
                    <div style={{ width: "120px" }}>
                        <input 
                            type="text" 
                            value={startTime} 
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="00:00"
                            style={{
                                padding: "8px 10px",
                                border: "2px solid #e0e0e0",
                                borderRadius: "8px",
                                fontSize: "13px",
                                width: "100%",
                                backgroundColor: "#f8f9fa",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#4A90E2"}
                            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                        />
                    </div>
                    <span style={{ 
                        color: "#666",
                        fontSize: "14px",
                        fontWeight: "500",
                        flex: "0 0 auto",
                        marginLeft: "20px"
                    }}>to</span>
                    <div style={{ width: "120px" }}>
                        <input 
                            type="text" 
                            value={endTime} 
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="23:59"
                            style={{
                                padding: "8px 10px",
                                border: "2px solid #e0e0e0",
                                borderRadius: "8px",
                                fontSize: "13px",
                                width: "100%",
                                backgroundColor: "#f8f9fa",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#4A90E2"}
                            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={searchVenues}
                style={{
                    padding: "12px 20px",
                    backgroundColor: "#2C3E50",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                    marginTop: "5px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 15px rgba(44, 62, 80, 0.2)"
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#34495E";
                    e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#2C3E50";
                    e.target.style.transform = "translateY(0)";
                }}
            >
                🔍 Search Venues
            </button>
        </div>
    );
};

const MapComponent = () => {
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [venueDetails, setVenueDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
    const [mapZoom, setMapZoom] = useState(13);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [latitude, setLatitude] = useState('40.7128');
    const [longitude, setLongitude] = useState('-74.0060');
    const [radius, setRadius] = useState('5000');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const mapRef = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3001/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const searchVenues = async () => {
        try {
            const params = {
                latitude,
                longitude,
                radius,
                category: selectedCategory,
                startTime,
                endTime
            };
            const response = await axios.get('http://localhost:3001/search', { params });
            setVenues(response.data.venues || []);
            setMapCenter([parseFloat(latitude), parseFloat(longitude)]);
        } catch (error) {
            console.error('Error searching venues:', error);
        }
    };

    const handleVenueClick = async (venue) => {
        setSelectedVenue(venue);
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:3001/venue/${venue.venue_id}`);
            setVenueDetails(response.data);
        } catch (error) {
            console.error('Error fetching venue details:', error);
            setError('Failed to load venue details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ height: '100vh', width: '100%', position: 'relative' }}>
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FixMap />
                <MapUpdater center={mapCenter} />

                {venues.map((venue) => (
                    <Marker
                        key={venue.venue_id}
                        position={[venue.latitude, venue.longitude]}
                        eventHandlers={{
                            click: () => handleVenueClick(venue),
                        }}
                    >
                        <Popup>
                            <Typography variant="h6">{venue.venue_name}</Typography>
                            <Typography variant="body2">Category: {venue.category_name}</Typography>
                        </Popup>
                    </Marker>
                ))}

                <SearchPanel
                    latitude={latitude}
                    setLatitude={setLatitude}
                    longitude={longitude}
                    setLongitude={setLongitude}
                    radius={radius}
                    setRadius={setRadius}
                    category={selectedCategory}
                    setCategory={setSelectedCategory}
                    categories={categories}
                    searchVenues={searchVenues}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                />
            </MapContainer>

            {selectedVenue && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        padding: 2,
                        maxWidth: 400,
                        maxHeight: '80vh',
                        overflow: 'auto',
                        zIndex: 1000,
                    }}
                >
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : venueDetails ? (
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                {venueDetails.venue_name}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Category: {venueDetails.category_name}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Address: {venueDetails.address}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Check-ins: {venueDetails.checkin_count}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Users: {venueDetails.user_count}
                            </Typography>
                        </Box>
                    ) : null}
                </Paper>
            )}
        </Box>
    );
};

export default MapComponent;
