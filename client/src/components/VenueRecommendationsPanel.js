import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, CircularProgress, Divider, IconButton } from '@mui/material';
import L from 'leaflet';

const VenueRecommendationsPanel = ({ venues, loading, error, mapRef, onClose }) => {
 
  React.useEffect(() => {
    const markers = [];
    
    if (mapRef.current && venues && venues.length > 0) {

      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker && layer._recommendationMarker) {
          mapRef.current.removeLayer(layer);
        }
      });
      

      venues.forEach((venue, index) => {
        const marker = L.marker([venue.latitude, venue.longitude], {
          icon: L.divIcon({
            html: `<div style="background-color: #3498db; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">${index + 1}</div>`,
            className: 'recommendation-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        });
        
        marker._recommendationMarker = true;
        marker.addTo(mapRef.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 5px 0;">${venue.category}</h3>
              <p style="margin: 5px 0;"><strong>Popularity:</strong> ${venue.visit_count} visits</p>
              <p style="margin: 5px 0;"><strong>Common among:</strong> ${venue.user_count} similar users</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> [${venue.latitude.toFixed(5)}, ${venue.longitude.toFixed(5)}]</p>
            </div>
          `);
        
        markers.push(marker);
      });
      
     
      if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.eachLayer(layer => {
          if (layer instanceof L.Marker && layer._recommendationMarker) {
            mapRef.current.removeLayer(layer);
          }
        });
      }
    };
  }, [venues, mapRef]);
  
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 80,
        right: 20,
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
        backgroundColor: "#3498db",
        margin: "-25px -25px 20px -25px",
        padding: "20px",
        borderRadius: "20px 20px 0 0",
        textAlign: "center",
        boxShadow: "0 4px 15px rgba(52, 152, 219, 0.2)",
        position: "relative"
      }}>
        {/* 关闭按钮 */}
        <div 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "16px",
            color: "white",
            transition: "background-color 0.2s",
            userSelect: "none"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
        >
          ✕
        </div>
        
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
          <span style={{ fontSize: "24px" }}>🌟</span>
          Recommended Venues
        </h2>
        <div style={{
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "14px",
          marginTop: "5px"
        }}>
          Based on similar users' trajectories
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress size={40} style={{ color: "#3498db" }} />
        </div>
      )}

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

      {!loading && !error && venues && venues.length === 0 && (
        <Typography variant="body1" style={{ textAlign: 'center', padding: '20px' }}>
          No venue recommendations available yet. Select similar users to generate recommendations.
        </Typography>
      )}

      {!loading && !error && venues && venues.length > 0 && (
        <>
          <Typography variant="body2" style={{ marginBottom: '10px' }}>
            Discovered {venues.length} venues that similar users have visited. These places might interest you based on trajectory pattern analysis.
          </Typography>
          
          <List>
            {venues.map((venue, index) => (
              <React.Fragment key={venue.venue_id}>
                <ListItem 
                  style={{
                    borderRadius: '8px',
                    marginBottom: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    padding: '12px'
                  }}
                >
                  <div 
                    style={{ 
                      backgroundColor: '#3498db',
                      color: 'white',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    {index + 1}
                  </div>
                  <ListItemText
                    primary={
                      <Typography variant="body1" style={{ fontWeight: '600', color: '#2c3e50' }}>
                        {venue.category}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary">
                          Visited by <b>{venue.user_count}</b> similar users
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="textSecondary">
                          Total visits: <b>{venue.visit_count}</b>
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < venues.length - 1 && <Divider variant="middle" />}
              </React.Fragment>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default VenueRecommendationsPanel; 