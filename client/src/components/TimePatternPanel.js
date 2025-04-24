import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

const TimePatternPanel = () => {
    const [dayType, setDayType] = useState('weekday');
    const [timeSlot, setTimeSlot] = useState('morning');
    const [data, setData] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    const fetchTimePatterns = async () => {
        try {
            const response = await axios.get('http://localhost:5001/time-patterns', {
                params: { dayType, timeSlot }
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching time patterns:', error);
        }
    };

    if (!isVisible) {
        return (
            <button 
                onClick={() => {
                    setIsVisible(true);
                    fetchTimePatterns();
                }}
                style={{
                    position: "absolute",
                    right: "20px",
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
                Show Time Patterns
            </button>
        );
    }

    return (
        <div style={{
            position: "absolute",
            right: "20px",
            bottom: "20px",
            width: "300px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            zIndex: 1000
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0 }}>Time Pattern Analysis</h3>
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
            <div style={{ marginBottom: "15px" }}>
                <div style={{ marginBottom: "10px" }}>
                    <label style={{ marginRight: "10px" }}>Day Type:</label>
                    <select 
                        value={dayType} 
                        onChange={(e) => setDayType(e.target.value)}
                        style={{
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ddd"
                        }}
                    >
                        <option value="weekday">Weekday</option>
                        <option value="weekend">Weekend</option>
                    </select>
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label style={{ marginRight: "10px" }}>Time Slot:</label>
                    <select 
                        value={timeSlot} 
                        onChange={(e) => setTimeSlot(e.target.value)}
                        style={{
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ddd"
                        }}
                    >
                        <option value="morning">Morning (6-11)</option>
                        <option value="afternoon">Afternoon (12-17)</option>
                        <option value="evening">Evening (18-23)</option>
                        <option value="night">Night (0-5)</option>
                    </select>
                </div>
                <button 
                    onClick={fetchTimePatterns}
                    style={{
                        padding: "8px 15px",
                        backgroundColor: "#2C3E50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        width: "100%"
                    }}
                >
                    Analyze Time Patterns
                </button>
            </div>
            {data.length > 0 && (
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                    {data.map((item, index) => (
                        <div key={index} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                            fontSize: "14px",
                            padding: "5px 0",
                            borderBottom: index < data.length - 1 ? "1px solid #eee" : "none"
                        }}>
                            <span>{item.venue_category_name}</span>
                            <span>{item.visit_count} visits</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimePatternPanel;
