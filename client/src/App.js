import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchPanel from './components/SearchPanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import SimilarUsersPanel from './components/SimilarUsersPanel';
import './App.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {
    const [venues, setVenues] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activePanel, setActivePanel] = useState('search');
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:3001/categories');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCategories(data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleSearch = async (params) => {
        try {
            const queryParams = new URLSearchParams({
                latitude: params.latitude,
                longitude: params.longitude,
                radius: params.radius,
                ...(params.category && { category: params.category }),
                ...(params.startTime && { startTime: params.startTime }),
                ...(params.endTime && { endTime: params.endTime }),
                k: params.k  // 添加k参数
            });

            const response = await fetch(`http://localhost:3001/search?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Received data:", data);  // 添加日志
            
            // 转换数据格式以匹配前端期望的格式
            const formattedVenues = data.venues.map(venue => ({
                venue_id: venue.venue_id,
                venue_category_name: venue.category,
                latitude: venue.location.latitude,
                longitude: venue.location.longitude,
                distance: venue.distance,
                checkin_count: venue.checkins.count,
                checkin_times: venue.checkins.times
            }));
            
            setVenues(formattedVenues);
        } catch (error) {
            console.error('Error searching venues:', error);
            setVenues([]);
        }
    };

    // 清除地图上的所有图层
    const clearMap = () => {
        if (mapRef.current) {
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
                    mapRef.current.removeLayer(layer);
                }
            });
        }
    };

    // 处理面板切换
    const handlePanelChange = (panel) => {
        clearMap();  // 清除地图上的所有图层
        setActivePanel(panel);
    };

    return (
        <div className="App">
            <MapContainer
                center={[40.7128, -74.0060]}
                zoom={13}
                style={{ height: "100vh", width: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {venues.map((venue, index) => (
                    <Marker 
                        key={index} 
                        position={[venue.latitude, venue.longitude]}
                    >
                        <Popup>
                            <div>
                                <h3>{venue.venue_name}</h3>
                                <p>Category: {venue.venue_category_name}</p>
                                <p>Check-ins: {venue.checkin_count}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* 功能切换按钮 - 右上角 */}
            <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 1000,
                display: 'flex',
                gap: '10px'
            }}>
                <button 
                    onClick={() => handlePanelChange('search')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: activePanel === 'search' ? '#2C3E50' : '#fff',
                        color: activePanel === 'search' ? '#fff' : '#2C3E50',
                        border: '2px solid #2C3E50',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    🔍 Search
                </button>
                <button 
                    onClick={() => handlePanelChange('recommendations')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: activePanel === 'recommendations' ? '#2C3E50' : '#fff',
                        color: activePanel === 'recommendations' ? '#fff' : '#2C3E50',
                        border: '2px solid #2C3E50',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    📊 Recommendations
                </button>
                <button 
                    onClick={() => handlePanelChange('similar-users')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: activePanel === 'similar-users' ? '#2C3E50' : '#fff',
                        color: activePanel === 'similar-users' ? '#fff' : '#2C3E50',
                        border: '2px solid #2C3E50',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    👥 Similar Users
                </button>
            </div>

            {activePanel === 'search' && (
                <SearchPanel 
                    onSearch={handleSearch} 
                    categories={categories}
                    mapRef={mapRef}
                />
            )}
            {activePanel === 'recommendations' && <RecommendationsPanel mapRef={mapRef} />}
            {activePanel === 'similar-users' && <SimilarUsersPanel mapRef={mapRef} />}

            <MapContainer 
                center={[40.7128, -74.0060]} 
                zoom={13} 
                style={{ height: "100vh", width: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {venues.map((venue, index) => (
                    <Marker 
                        key={index} 
                        position={[venue.latitude, venue.longitude]}
                    >
                        <Popup>
                            <div>
                                <h3>{venue.venue_name}</h3>
                                <p>Category: {venue.venue_category_name}</p>
                                <p>Check-ins: {venue.checkin_count}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default App;