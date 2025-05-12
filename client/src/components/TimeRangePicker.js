import React from 'react';

const TimeRangePicker = ({ startTime, endTime, onStartTimeChange, onEndTimeChange }) => {
    return (
        <div style={{ 
            display: "flex", 
            gap: "12px",
            alignItems: "center",
            justifyContent: "flex-start"
        }}>
            <div style={{ width: "120px" }}>
                <input 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => onStartTimeChange(e.target.value)}
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
                    type="time" 
                    value={endTime} 
                    onChange={(e) => onEndTimeChange(e.target.value)}
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
    );
};

export default TimeRangePicker; 