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

// Component to fix map rendering issues
const FixMap = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 500);
    }, [map]);
    return null;
};

// Component to update the map's center position when a new search is made
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

// Search panel for input fields
const SearchPanel = ({ latitude, setLatitude, longitude, setLongitude, limit, setLimit, searchStores }) => {
    return (
        <div style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            zIndex: 1000,
            width: "400px",
            padding: "30px",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 20px rgba(0,0,0,0.15)",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
        }}>
            <h2 style={{ color: "#333", marginBottom: "20px" }}>Search Nearby McDonald's</h2>
            
            <div className="input-group">
                <label>Latitude:</label>
                <input 
                    type="number" 
                    value={latitude} 
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "16px",
                        width: "100%"
                    }}
                />
            </div>

            <div className="input-group">
                <label>Longitude:</label>
                <input 
                    type="number" 
                    value={longitude} 
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "16px",
                        width: "100%"
                    }}
                />
            </div>

            <div className="input-group">
                <label>Display the number of restaurants:</label>
                <select 
                    value={limit} 
                    onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
                    style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "16px",
                        width: "100%"
                    }}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                </select>
            </div>

            <button 
                onClick={searchStores}
                style={{
                    padding: "12px 24px",
                    backgroundColor: "#FF6B6B",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                    marginTop: "20px",
                    transition: "background-color 0.3s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#FF5252"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#FF6B6B"}
            >
                Search for nearby restaurants
            </button>
        </div>
    );
};

// Main Map Component
const MapComponent = () => {
    const [latitude, setLatitude] = useState(35.2304);
    const [longitude, setLongitude] = useState(-100.4737);
    const [limit, setLimit] = useState(5);
    const [stores, setStores] = useState([]);

    const searchStores = async () => {
        const searchParams = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            limit: parseInt(limit)
        };

        console.log("Sending search request with params:", searchParams);

        try {
            const res = await axios.get("http://localhost:5000/search", {
                params: searchParams
            });

            console.log("API response:", res);

            if (res.data && Array.isArray(res.data)) {
                if (res.data.length === 0) {
                    alert("No McDonald's locations found nearby. Try another location.");
                } else {
                    console.log("Filtered store data:", res.data);

                    // Ensure all stores have valid latitude and longitude
                    const validStores = res.data.filter(store => 
                        store.latitude !== null && store.longitude !== null &&
                        !isNaN(parseFloat(store.latitude)) &&
                        !isNaN(parseFloat(store.longitude))
                    );

                    console.log("Valid stores after filtering:", validStores);
                    setStores(validStores);
                }
            } else {
                console.error("Unexpected API response format:", res.data);
                alert("Error in search results format. Check console for details.");
            }
        } catch (err) {
            console.error("Search error:", err.response || err);
            alert(err.response?.data?.error || "Error during search. Check console.");
        }
    };

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            <MapContainer 
                center={[latitude, longitude]} 
                zoom={13} 
                style={{ 
                    width: "100%", 
                    height: "100%",
                    zIndex: 1
                }}
            >
                <MapUpdater center={[latitude, longitude]} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Search center marker */}
                <Marker position={[latitude, longitude]}>
                    <Popup>Current position</Popup>
                </Marker>

                {/* Render store markers if they have valid coordinates */}
                {stores.map((store, index) => {
                    const lat = parseFloat(store.latitude);
                    const lng = parseFloat(store.longitude);

                    if (isNaN(lat) || isNaN(lng)) {
                        console.warn(`Skipping invalid store coordinates: ${store.store_name}`, store);
                        return null;
                    }

                    return (
                        <Marker key={index} position={[lat, lng]}>
                            <Popup>
                                <div style={{ padding: "10px", minWidth: "200px" }}>
                                    <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{store.store_name}</h3>
                                    <p>Address: {store.store_address}</p>
                                    <p>Rating: {store.rating}⭐</p>
                                    <p>Distance: {Math.round(store.distance)} meters</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
                <FixMap />
            </MapContainer>
            
            <SearchPanel 
                latitude={latitude}
                setLatitude={setLatitude}
                longitude={longitude}
                setLongitude={setLongitude}
                limit={limit}
                setLimit={setLimit}
                searchStores={searchStores}
            />
        </div>
    );
};

export default MapComponent;
