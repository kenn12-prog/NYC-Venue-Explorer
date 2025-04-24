import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

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

const SearchPanel = ({ latitude, setLatitude, longitude, setLongitude, radius, setRadius, category, setCategory, categories, searchVenues }) => {
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

// 新增：时间模式分析面板
const TimePatternPanel = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    return (
        <div style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            width: "300px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            zIndex: 1000
        }}>
            <h3 style={{ margin: "0 0 15px 0" }}>Popular Categories</h3>
            {data.map((item, index) => (
                <div key={index} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "14px"
                }}>
                    <span>{item.venue_category_name}</span>
                    <span>{item.visit_count} visits</span>
                </div>
            ))}
        </div>
    );
};

// 新增：热门场所面板
const PopularVenuesPanel = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div style={{
            position: "absolute",
            right: "20px",
            top: "250px",
            width: "300px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            zIndex: 1000,
            maxHeight: "400px",
            overflowY: "auto"
        }}>
            <h3 style={{ margin: "0 0 15px 0" }}>Popular Venues Nearby</h3>
            {data.map((venue, index) => (
                <div key={index} style={{
                    marginBottom: "15px",
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <div style={{ fontWeight: "500" }}>{venue.venue_category_name}</div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                        <div>Check-ins: {venue.checkin_count}</div>
                        <div>Unique visitors: {venue.unique_visitors}</div>
                        <div>Distance: {venue.distance}m</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MapComponent = () => {
    const [latitude, setLatitude] = useState(40.7128);
    const [longitude, setLongitude] = useState(-74.0060);
    const [radius, setRadius] = useState(5000);
    const [category, setCategory] = useState("");
    const [venues, setVenues] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // 新增状态
    const [timePatternData, setTimePatternData] = useState([]);
    const [popularVenues, setPopularVenues] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("all");
    const [selectedDayType, setSelectedDayType] = useState("all");

    useEffect(() => {
        // 获取所有可用的场所类别
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5001/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // 新增：获取时间模式数据
    const fetchTimePatterns = async () => {
        try {
            const response = await axios.get('http://localhost:5001/time-patterns', {
                params: {
                    dayType: selectedDayType,
                    timeSlot: selectedTimeSlot
                }
            });
            setTimePatternData(response.data);
        } catch (error) {
            console.error('Error fetching time patterns:', error);
        }
    };

    // 新增：获取热门场所数据
    const fetchPopularVenues = async () => {
        try {
            const response = await axios.get('http://localhost:5001/popular-venues', {
                params: {
                    latitude,
                    longitude,
                    radius
                }
            });
            setPopularVenues(response.data);
        } catch (error) {
            console.error('Error fetching popular venues:', error);
        }
    };

    // 修改searchVenues函数来同时获取所有数据
    const searchVenues = async () => {
        try {
            const [venuesRes, popularRes, patternsRes] = await Promise.all([
                axios.get('http://localhost:5001/search', {
                    params: {
                        latitude,
                        longitude,
                        radius,
                        category: category || undefined
                    }
                }),
                axios.get('http://localhost:5001/popular-venues', {
                    params: {
                        latitude,
                        longitude,
                        radius
                    }
                }),
                axios.get('http://localhost:5001/time-patterns', {
                    params: {
                        dayType: selectedDayType,
                        timeSlot: selectedTimeSlot
                    }
                })
            ]);

            setVenues(venuesRes.data.venues || []);
            setPopularVenues(popularRes.data);
            setTimePatternData(patternsRes.data);
        } catch (error) {
            console.error('Error searching data:', error);
        }
    };

    return (
        <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
            <MapContainer
                center={[latitude, longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FixMap />
                <MapUpdater center={[latitude, longitude]} />
                
                {/* User's selected location */}
                <Marker position={[latitude, longitude]} icon={homeIcon}>
                    <Popup>Selected Location</Popup>
                </Marker>

                {/* Nearby venues */}
                {venues.map((venue, index) => (
                    <Marker
                        key={index}
                        position={[venue.latitude, venue.longitude]}
                        icon={venueIcon}
                    >
                        <Popup>
                            <div>
                                <h3>{venue.venue_category_name}</h3>
                                <p>Distance: {venue.distance}m</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <SearchPanel
                latitude={latitude}
                setLatitude={setLatitude}
                longitude={longitude}
                setLongitude={setLongitude}
                radius={radius}
                setRadius={setRadius}
                category={category}
                setCategory={setCategory}
                categories={categories}
                searchVenues={searchVenues}
            />

            <TimePatternPanel data={timePatternData} />
            <PopularVenuesPanel data={popularVenues} />
        </div>
    );
};

export default MapComponent;
