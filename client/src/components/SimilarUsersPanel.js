import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, LinearProgress, List, ListItem, ListItemButton, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import L from 'leaflet';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import VenueRecommendationsPanel from './VenueRecommendationsPanel';

const SimilarUsersPanel = ({ mapRef = { current: null } }) => {
  const [userId, setUserId] = useState('698');
  const [similarUsers, setSimilarUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetUserTrajectory, setTargetUserTrajectory] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const trajectoryLayers = useRef(new Map());
  const searchLocationMarkerRef = useRef(null);
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedHour, setSelectedHour] = useState(0);
  
  // 新增推荐场所相关状态
  const [recommendedVenues, setRecommendedVenues] = useState([]);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueError, setVenueError] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Create color scale for trajectories
  const colorScale = scaleOrdinal(schemeCategory10);

  // 生成24小时选项
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 验证坐标点是否有效
  const isValidPoint = (point) => {
    return point && 
           typeof point.latitude === 'number' && 
           typeof point.longitude === 'number' &&
           !isNaN(point.latitude) && 
           !isNaN(point.longitude) &&
           point.latitude >= -90 && 
           point.latitude <= 90 &&
           point.longitude >= -180 && 
           point.longitude <= 180;
  };

  // 清除所有轨迹图层
  const clearAllLayers = useCallback(() => {
    if (mapRef.current) {
      trajectoryLayers.current.forEach((layer) => {
        mapRef.current.removeLayer(layer);
      });
      trajectoryLayers.current.clear();
    }
  }, [mapRef]);

  // 处理地图点击事件
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = (e) => {
      setSelectedPoint({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
      setTimeDialogOpen(true);
    };

    mapRef.current.on('click', handleMapClick);
    return () => {
      mapRef.current.off('click', handleMapClick);
    };
  }, [mapRef]);

  // 添加轨迹点到地图
  const addTrajectoryPoint = useCallback((lat, lng, hour) => {
    if (mapRef.current) {
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

      marker.bindPopup(`Time: ${hour}:00`).openPopup();
      const newPoint = { latitude: lat, longitude: lng, hour };
      setTargetUserTrajectory(prev => {
        const newTrajectory = [...prev, newPoint];
        console.log('Current trajectory:', newTrajectory);
        return newTrajectory;
      });
    }
  }, [mapRef]);

  // 处理时间选择对话框确认
  const handleTimeConfirm = () => {
    if (selectedPoint) {
      addTrajectoryPoint(selectedPoint.lat, selectedPoint.lng, selectedHour);
      setTimeDialogOpen(false);
      setSelectedPoint(null);
    }
  };

  // 处理时间选择对话框取消
  const handleTimeCancel = () => {
    setTimeDialogOpen(false);
    setSelectedPoint(null);
  };

  // 查找相似轨迹
  const findSimilarTrajectories = async () => {
    if (!targetUserTrajectory || targetUserTrajectory.length === 0) {
      setError('Please add at least one point to the trajectory');
      return;
    }

    setLoading(true);
    setError(null);
    clearAllLayers();
    // 重置推荐场所
    setRecommendedVenues([]);
    setShowRecommendations(false);

    try {
      console.log('Sending trajectory to server:', targetUserTrajectory);
      const response = await axios.post('http://localhost:3001/similar-trajectories', {
        trajectory: targetUserTrajectory
      });
      console.log('Server response:', response.data);

      if (!response.data || response.data.length === 0) {
        setError('No similar trajectories found');
        return;
      }

      setSimilarUsers(response.data);
    } catch (err) {
      console.error('Error finding similar trajectories:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to find similar trajectories');
    } finally {
      setLoading(false);
    }
  };

  // 获取推荐场所
  const getRecommendedVenues = async () => {
    if (selectedUsers.size === 0) {
      setVenueError('Please select at least one similar user');
      return;
    }

    setVenueLoading(true);
    setVenueError(null);
    setShowRecommendations(true);

    try {
      const userIds = Array.from(selectedUsers);
      console.log('Requesting venue recommendations for users:', userIds);
      
      const response = await axios.post('http://localhost:3001/recommend-venues-from-similar-users', {
        userIds: userIds
      });
      
      console.log('Venue recommendations response:', response.data);
      setRecommendedVenues(response.data);
      
      if (!response.data || response.data.length === 0) {
        setVenueError('No common venues found among selected users');
      }
    } catch (err) {
      console.error('Error getting venue recommendations:', err);
      setVenueError(err.response?.data?.error || 'Failed to get venue recommendations');
      setRecommendedVenues([]);
    } finally {
      setVenueLoading(false);
    }
  };

  // 关闭推荐面板
  const handleCloseRecommendations = () => {
    setShowRecommendations(false);
    
    // 清除地图上的标记
    if (mapRef.current) {
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker && layer._recommendationMarker) {
          mapRef.current.removeLayer(layer);
        }
      });
    }
  };

  // 切换推荐面板
  const toggleRecommendationsPanel = () => {
    if (showRecommendations) {
      handleCloseRecommendations();
    } else {
      getRecommendedVenues();
    }
  };

  // 处理用户选择
  const handleUserClick = (userId) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (newSelectedUsers.has(userId)) {
      newSelectedUsers.delete(userId);
      // 移除轨迹图层
      if (trajectoryLayers.current.has(userId)) {
        mapRef.current.removeLayer(trajectoryLayers.current.get(userId));
        trajectoryLayers.current.delete(userId);
      }
    } else {
      newSelectedUsers.add(userId);
      // 添加轨迹图层
      const user = similarUsers.find(u => u.userId === userId);
      if (user) {
        const points = user.trajectory.map(point => [point.latitude, point.longitude]);
        const polyline = L.polyline(points, {
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          weight: 3
        }).addTo(mapRef.current);
        trajectoryLayers.current.set(userId, polyline);
      }
    }
    setSelectedUsers(newSelectedUsers);
    
    // 如果没有选中用户，隐藏推荐面板
    if (newSelectedUsers.size === 0) {
      handleCloseRecommendations();
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearAllLayers();
    };
  }, [clearAllLayers]);

  return (
    <>
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
            <span style={{ fontSize: "24px" }}>👥</span>
            Similar Trajectories
          </h2>
          <div style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "14px",
            marginTop: "5px"
          }}>
            Click on the map to add trajectory points
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Added Points: {targetUserTrajectory?.length || 0}
          </Typography>
          <button
            onClick={findSimilarTrajectories}
            disabled={loading || !targetUserTrajectory || targetUserTrajectory.length === 0}
            style={{
              padding: "12px 20px",
              backgroundColor: "#2C3E50",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: "600",
              width: "100%",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <CircularProgress size={20} style={{ color: "white" }} />
            ) : (
              "Find Similar Trajectories"
            )}
          </button>
        </div>

        {error && (
          <div style={{
            color: "#d32f2f",
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#ffebee",
            borderRadius: "8px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {similarUsers.length > 0 && (
          <>
            <List>
              {similarUsers.map((user) => (
                <ListItem
                  key={user.userId}
                  button
                  onClick={() => handleUserClick(user.userId)}
                  selected={selectedUsers.has(user.userId)}
                  style={{
                    marginBottom: "8px",
                    borderRadius: "8px",
                    backgroundColor: selectedUsers.has(user.userId) ? "#f5f5f5" : "white",
                    borderLeft: `4px solid ${selectedUsers.has(user.userId) ? "#2C3E50" : "transparent"}`
                  }}
                >
                  <ListItemText
                    primary={`User ${user.userId}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textPrimary">
                          Similarity: {(user.similarity * 100).toFixed(2)}%
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="textSecondary">
                          DTW Distance: {user.distance.toFixed(2)}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="textSecondary">
                          Points: {user.trajectory.length}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            {/* 添加推荐场所按钮 */}
            {selectedUsers.size > 0 && (
              <button
                onClick={toggleRecommendationsPanel}
                disabled={venueLoading}
                style={{
                  padding: "12px 20px",
                  backgroundColor: showRecommendations ? "#e74c3c" : "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: venueLoading ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                  width: "100%",
                  marginTop: "15px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {venueLoading ? (
                  <CircularProgress size={20} style={{ color: "white" }} />
                ) : (
                  <>
                    <span style={{ fontSize: "18px" }}>{showRecommendations ? "✕" : "🌟"}</span>
                    {showRecommendations ? "Hide Recommendations" : "Get Venue Recommendations"}
                  </>
                )}
              </button>
            )}
          </>
        )}
      </Paper>

      {/* 时间选择对话框 */}
      <Dialog open={timeDialogOpen} onClose={handleTimeCancel}>
        <DialogTitle>Select Time for Trajectory Point</DialogTitle>
        <DialogContent>
          <FormControl fullWidth style={{ marginTop: '16px' }}>
            <InputLabel>Hour</InputLabel>
            <Select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              label="Hour"
            >
              {hours.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {hour}:00
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTimeCancel}>Cancel</Button>
          <Button onClick={handleTimeConfirm} variant="contained" color="primary">
            Add Point
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 显示推荐场所面板 */}
      {showRecommendations && (
        <VenueRecommendationsPanel 
          venues={recommendedVenues} 
          loading={venueLoading} 
          error={venueError} 
          mapRef={mapRef} 
          onClose={handleCloseRecommendations}
        />
      )}
    </>
  );
};

export default SimilarUsersPanel; 