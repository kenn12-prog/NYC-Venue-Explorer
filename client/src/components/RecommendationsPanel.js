import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Slider } from '@mui/material';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet.heat';

const RecommendationsPanel = ({ mapRef = { current: null } }) => {
  const [latitude, setLatitude] = useState('40.7128');
  const [longitude, setLongitude] = useState('-74.0060');
  const [radius, setRadius] = useState(1000);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentHeatmapData, setCurrentHeatmapData] = useState(null);
  const searchLocationMarkerRef = useRef(null);  // 添加搜索位置标记的引用

  // 清除热力图但保留搜索位置标记
  const clearHeatmap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.HeatLayer || layer instanceof L.CircleMarker) {
          mapRef.current.removeLayer(layer);
        }
      });
    }
  }, [mapRef]);

  // 更新搜索位置标记
  const updateSearchLocationMarker = useCallback((lat, lng) => {
    if (mapRef.current) {
      // 如果已存在标记，先移除
      if (searchLocationMarkerRef.current) {
        mapRef.current.removeLayer(searchLocationMarkerRef.current);
      }

      // 创建新的标记
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: '#2C3E50',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapRef.current);

      // 保存标记引用
      searchLocationMarkerRef.current = marker;
    }
  }, [mapRef]);

  // 创建热力图
  const createHeatmap = useCallback((points) => {
    if (!mapRef?.current || !points?.length) return null;

    try {
      const heatmapData = points.map(point => [
        point.lat,
        point.lng,
        point.count
      ]);

      return L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: 1.0,
        gradient: {
          0.4: 'blue',
          0.6: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      });
    } catch (err) {
      console.warn('Error creating heatmap:', err);
      return null;
    }
  }, [mapRef]);

  // 绘制热力图
  const drawHeatmap = useCallback((points) => {
    if (!mapRef?.current) return;

    // 清除现有热力图
    clearHeatmap();

    // 转换数据格式并添加权重
    const heatmapData = points.map(point => [
      point.lat,
      point.lng,
      point.count * 2  // 增加权重使热力图更明显
    ]);

    // 创建热力图图层
    const heat = L.heatLayer(heatmapData, {
      radius: 12,           // 减小半径使圆形更清晰
      blur: 1,             // 减小模糊效果
      maxZoom: 18,         // 最大缩放级别
      max: 1,           // 最大强度
      gradient: {          // 自定义渐变色
        0.2: '#ffffff',   // 浅黄色
        0.4: '#ffeda0',   // 浅黄色
        0.6: '#feb24c',   // 橙色
        0.8: '#f03b20',   // 红色 
        1.0: '#bd0026'    // 深红色
      },
      minOpacity: 0.7     // 增加最小不透明度
    }).addTo(mapRef.current);

    // 为每个点添加点击事件，使用更大的点击区域
    points.forEach(point => {
      L.circleMarker([point.lat, point.lng], {
        radius: 20,  // 增加点击区域半径
        fillColor: 'transparent',  // 透明填充
        color: 'transparent',      // 透明边框
        interactive: true,         // 确保可交互
        bubblingMouseEvents: false // 防止事件冒泡
      })
      .bindPopup(`
        <div style="padding: 5px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Check-ins: ${point.count}</div>
          <div style="font-size: 12px; color: #666;">
            ${selectedCategory}
          </div>
        </div>
      `, {
        closeButton: false,        // 移除关闭按钮
        offset: [0, -10],         // 调整弹出窗口位置
        className: 'custom-popup'  // 自定义样式类
      })
      .addTo(mapRef.current);
    });

    setHeatmapLayer(heat);
    setCurrentHeatmapData(points);
  }, [mapRef, clearHeatmap, selectedCategory]);

  // 处理地图缩放
  useEffect(() => {
    if (!mapRef?.current) return;

    const map = mapRef.current;
    let zoomTimeout;

    const handleZoom = () => {
      // 清除之前的定时器
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
      }

      // 延迟重新渲染热力图
      zoomTimeout = setTimeout(() => {
        if (currentHeatmapData) {
          drawHeatmap(currentHeatmapData);
        }
      }, 150); // 150ms 延迟
    };

    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
      }
    };
  }, [mapRef, currentHeatmapData, drawHeatmap]);

  const handleSearch = async () => {
    if (!latitude || !longitude) {
      setError('Please enter latitude and longitude');
      return;
    }

    setLoading(true);
    setError(null);
    clearHeatmap();
    setCurrentHeatmapData(null);

    // 更新搜索位置标记
    updateSearchLocationMarker(parseFloat(latitude), parseFloat(longitude));

    try {
      const response = await axios.get('http://localhost:3001/recommendations', {
        params: {
          latitude,
          longitude,
          radius,
          startTime,
          endTime
        }
      });

      setRecommendations(response.data);
      
      if (response.data.length > 0) {
        setSelectedCategory(response.data[0].venue_category_name);
        drawHeatmap(response.data[0].heatmap_points);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.error || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  // 处理类别选择
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const categoryData = recommendations.find(r => r.venue_category_name === category);
    if (categoryData) {
      drawHeatmap(categoryData.heatmap_points);
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearHeatmap();
      // 移除搜索位置标记
      if (searchLocationMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(searchLocationMarkerRef.current);
      }
    };
  }, [clearHeatmap, mapRef]);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 80,
        left: 20,
        padding: 2,
        width: 350,
        maxHeight: 'calc(100vh - 150px)',
        overflow: 'auto',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        marginBottom: '30px'
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
          <span style={{ fontSize: "24px" }}>📍</span>
          Popular Venue Categories
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
        }}>Search Radius: {(radius / 1000).toFixed(1)} km</label>
        <input 
          type="range" 
          value={radius} 
          onChange={(e) => setRadius(Number(e.target.value))}
          min={1000}
          max={20000}
          step={1000}
          style={{
            width: "100%",
            marginTop: "8px"
          }}
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
        disabled={loading}
        style={{
          padding: "12px 20px",
          backgroundColor: "#2C3E50",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "15px",
          fontWeight: "600",
          marginTop: "5px",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          boxShadow: "0 4px 15px rgba(44, 62, 80, 0.2)",
          opacity: loading ? 0.7 : 1
        }}
        onMouseOver={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = "#34495E";
            e.target.style.transform = "translateY(-2px)";
          }
        }}
        onMouseOut={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = "#2C3E50";
            e.target.style.transform = "translateY(0)";
          }
        }}
      >
        {loading ? (
          <CircularProgress size={20} style={{ color: "white" }} />
        ) : (
          <>
            <span style={{ fontSize: "18px" }}>📍</span>
            Get Recommendations
          </>
        )}
      </button>

      {error && (
        <div style={{
          color: "#d32f2f",
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#ffebee",
          borderRadius: "8px",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div style={{ 
          marginTop: "20px",
          marginBottom: "30px"
        }}>
          <h3 style={{
            color: "#2C3E50",
            fontSize: "18px",
            marginBottom: "15px",
            fontWeight: "600"
          }}>
            Top Categories
          </h3>
          {recommendations.map((category, index) => (
            <div
              key={index}
              onClick={() => handleCategorySelect(category.venue_category_name)}
              style={{
                padding: "15px",
                marginBottom: "10px",
                backgroundColor: selectedCategory === category.venue_category_name ? "#f5f5f5" : "white",
                borderRadius: "10px",
                cursor: "pointer",
                borderLeft: `4px solid ${selectedCategory === category.venue_category_name ? "#2C3E50" : "transparent"}`,
                transition: "all 0.3s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#f5f5f5"}
              onMouseOut={(e) => e.target.style.backgroundColor = selectedCategory === category.venue_category_name ? "#f5f5f5" : "white"}
            >
              <div style={{
                color: "#2C3E50",
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "5px"
              }}>
                {category.venue_category_name}
              </div>
              <div style={{
                color: "#666",
                fontSize: "14px",
                display: "flex",
                gap: "15px"
              }}>
                <span>Check-ins: {category.total_checkins}</span>
                <span>Venues: {category.venue_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
};

export default RecommendationsPanel; 