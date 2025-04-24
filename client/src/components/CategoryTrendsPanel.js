import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

const CategoryTrendsPanel = () => {
    const [data, setData] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    const fetchCategoryTrends = async () => {
        try {
            const response = await axios.get('http://localhost:5001/category-trends');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching category trends:', error);
        }
    };

    if (!isVisible) {
        return (
            <button 
                onClick={() => {
                    setIsVisible(true);
                    fetchCategoryTrends();
                }}
                style={{
                    position: "absolute",
                    left: "20px",
                    bottom: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#2C3E50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    zIndex: 1000,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}
            >
                Show Category Trends
            </button>
        );
    }

    return (
        <div style={{
            position: "absolute",
            left: "20px",
            bottom: "20px",
            width: "300px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            zIndex: 1000
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0 }}>Category Trends</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <FaTimes style={{ color: "#666" }} />
                </button>
            </div>
            <button 
                onClick={fetchCategoryTrends}
                style={{
                    padding: "8px 15px",
                    backgroundColor: "#2C3E50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                    marginBottom: "15px"
                }}
            >
                Refresh Data
            </button>
            {data.length > 0 && (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {data.map((item, index) => (
                        <div key={index} style={{
                            marginBottom: "20px",
                            padding: "10px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "8px"
                        }}>
                            <h4 style={{ margin: "0 0 10px 0" }}>{item.venue_category_name}</h4>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "5px",
                                fontSize: "12px"
                            }}>
                                {Object.entries(item.hourly_distribution).map(([hour, count]) => (
                                    <div key={hour} style={{
                                        padding: "5px",
                                        backgroundColor: "#f5f5f5",
                                        borderRadius: "4px",
                                        textAlign: "center"
                                    }}>
                                        <div>{hour}:00</div>
                                        <div>{count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryTrendsPanel;
