import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Paper } from '@mui/material';
import L from 'leaflet';

const SearchPanel = ({ onSearch, categories, mapRef }) => {
    const [latitude, setLatitude] = useState('40.7128');
    const [longitude, setLongitude] = useState('-74.0060');
    const [radius, setRadius] = useState('5000');
    const [category, setCategory] = useState('airport');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [k, setK] = useState('5');
    const searchLocationMarkerRef = useRef(null);

    // 更新搜索位置标记
    const updateSearchLocationMarker = useCallback((lat, lng) => {
        if (mapRef?.current) {
            // 如果已存在标记，先移除
            if (searchLocationMarkerRef.current) {
                mapRef.current.removeLayer(searchLocationMarkerRef.current);
            }

            // 创建新的标记，使用与目标地点相同的样式
            const marker = L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(mapRef.current);

          
            // 保存标记引用
            searchLocationMarkerRef.current = marker;
        }
    }, [mapRef]);

    // 处理搜索
    const handleSearch = () => {
        // 更新搜索位置标记
        updateSearchLocationMarker(parseFloat(latitude), parseFloat(longitude));
        
        // 执行搜索
        onSearch({ latitude, longitude, radius, category, startTime, endTime, k });
    };

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (searchLocationMarkerRef.current && mapRef?.current) {
                mapRef.current.removeLayer(searchLocationMarkerRef.current);
            }
        };
    }, [mapRef]);

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                top: 80,  // 给顶部按钮留出空间
                left: 20,  // 改为左侧
                padding: 2,
                width: 350,
                maxHeight: 'calc(100vh - 150px)',  // 调整最大高度
                overflow: 'auto',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
        >
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
                    <span style={{ fontSize: "24px" }}>🔍</span>
                    Venue Search
                </h2>
                <div style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "14px",
                    marginTop: "5px"
                }}>
                    Find Popular Venues Near You
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
                    type="number" 
                    value={latitude} 
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Enter latitude (e.g., 40.7128)"
                    step="0.0001"
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
                    type="number" 
                    value={longitude} 
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Enter longitude (e.g., -74.0060)"
                    step="0.0001"
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
                }}>K Nearest Neighbors:</label>
                <input 
                    type="number" 
                    value={k} 
                    onChange={(e) => setK(e.target.value)}
                    min="1"
                    max="100"
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
                }}>Radius (meters):</label>
                <input 
                    type="number" 
                    value={radius} 
                    onChange={(e) => setRadius(e.target.value)}
                    min="100"
                    max="50000"
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
                }}>Time Range:</label>
                <div style={{ 
                    display: "flex", 
                    gap: "12px",
                    alignItems: "center",
                    justifyContent: "flex-start"
                }}>
                    <div style={{ width: "140px" }}>
                        <input 
                            type="time" 
                            value={startTime} 
                            onChange={(e) => setStartTime(e.target.value)}
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
                    <div style={{ width: "140px" }}>
                        <input 
                            type="time" 
                            value={endTime} 
                            onChange={(e) => setEndTime(e.target.value)}
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
                onClick={handleSearch}
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
        </Paper>
    );
};

export default SearchPanel; 