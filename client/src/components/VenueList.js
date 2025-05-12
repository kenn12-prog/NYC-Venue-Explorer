const VenueList = ({ venues, onVenueClick }) => {
  return (
    <div className="venue-list">
      {venues.map((venue) => (
        <div
          key={venue.venue_id}
          className="venue-item"
          onClick={() => onVenueClick(venue)}
        >
          <div className="venue-info">
            <h3>{venue.venue_category_name}</h3>
            <p>Distance: {venue.distance.toFixed(2)} meters</p>
            <p>Check-ins: {venue.checkin_count}</p>
            {venue.checkin_times && venue.checkin_times.length > 0 && (
              <div className="checkin-times">
                <p>Check-in times:</p>
                <div className="time-chips">
                  {venue.checkin_times.map((time, index) => (
                    <span key={index} className="time-chip">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 