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

const storeIcon = new L.Icon({
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
    map.setView(center, 6);
  }, [center, map]);
  return null;
};

const SearchPanel = ({ latitude, setLatitude, longitude, setLongitude, limit, setLimit, days, setDays, searchStores }) => {
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
                backgroundColor: "#FF6B6B",
                margin: "-25px -25px 20px -25px",
                padding: "20px",
                borderRadius: "20px 20px 0 0",
                textAlign: "center",
                boxShadow: "0 4px 15px rgba(255, 107, 107, 0.2)"
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
                    <span style={{ fontSize: "24px" }}>🍔</span>
                    Find McDonald's
                </h2>
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
                    onFocus={(e) => e.target.style.borderColor = "#FF6B6B"}
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
                    onFocus={(e) => e.target.style.borderColor = "#FF6B6B"}
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
                }}>Number of restaurants:</label>
                <select 
                    value={limit} 
                    onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
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
                    <option value="5">5 restaurants</option>
                    <option value="10">10 restaurants</option>
                    <option value="15">15 restaurants</option>
                    <option value="20">20 restaurants</option>
                </select>
            </div>

            <div className="input-group">
                <label style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#4a4a4a",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>4 Star Reviews in the Last X Days:</label>
                <input 
                    type="text" 
                    value={days} 
                    onChange={(e) => setDays(e.target.value)} 
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
                    onFocus={(e) => e.target.style.borderColor = "#FF6B6B"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
            </div>
            <button 
                onClick={searchStores}
                style={{
                    padding: "12px 20px",
                    backgroundColor: "#FF6B6B",
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
                    boxShadow: "0 4px 15px rgba(255, 107, 107, 0.2)"
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#FF5252";
                    e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#FF6B6B";
                    e.target.style.transform = "translateY(0)";
                }}
            >
                🔍 Search
            </button>
        </div>
    );
};

const MapComponent = () => {
    const [latitude, setLatitude] = useState(30);
    const [longitude, setLongitude] = useState(-81.5);
    const [limit, setLimit] = useState(5);
    const [days, setDays] = useState(2);
    const [stores, setStores] = useState([]);

    const searchStores = async () => {
        const searchParams = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            limit: parseInt(limit),
            days: parseInt(days)
        };

        console.log("Sending search request with params:", searchParams);

        try {
            const res = await axios.get("http://localhost:5001/search", { params: searchParams });
            console.log("API response:", res);
            
            if (res.data && res.data.length > 0 && res.data[0].closest_shops) {
                setStores(res.data[0].closest_shops);
            } else {
                alert("No McDonald's locations found nearby. Try another location.");
            }
        } catch (err) {
            console.error("Search error:", err.response || err);
            alert(err.response?.data?.error || "Error during search. Check console.");
        }
    };

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            <MapContainer center={[latitude, longitude]} zoom={13} style={{ width: "100%", height: "100%", zIndex: 1 }}>
                <MapUpdater center={[latitude, longitude]} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[latitude, longitude]} icon={homeIcon}>
                    <Popup>Current position</Popup>
                </Marker>
                {stores.map((store, index) => (
                    <Marker key={index} position={[store.latitude, store.longitude]} icon={storeIcon}>
                        <Popup>{store.address}</Popup>
                    </Marker>
                ))}
                <FixMap />
            </MapContainer>
            <SearchPanel 
                latitude={latitude} setLatitude={setLatitude} 
                longitude={longitude} setLongitude={setLongitude} 
                limit={limit} setLimit={setLimit} 
                days={days} setDays={setDays} 
                searchStores={searchStores} 
            />
        </div>
    );
};

export default MapComponent;
