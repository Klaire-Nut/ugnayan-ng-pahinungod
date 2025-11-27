import React from "react";

const EventDetail = ({ event }) => {
  return (
    <div className="event-detail-page">
      <h1>EVENT</h1>

      <label>Event Title:</label>
      <input type="text" value={event.event_name} readOnly />

      <label>Description:</label>
      <textarea value={event.description} readOnly />

      <label>Venue:</label>
      <input type="text" value={event.location} readOnly />

      <label>Time:</label>
      <div className="row">
        <input type="text" value={event.date_start} readOnly />
        <input type="text" value={event.date_end} readOnly />
      </div>

      <label>Participants:</label>
      <input type="text" value={event.max_participants} readOnly />

      <h2>Volunteers</h2>
      <table className="vol-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Hours Rendered</th>
            <th>Signup Date</th>
          </tr>
        </thead>
        <tbody>
          {event.volunteers?.map((v) => (
            <tr key={v.volunteer_id}>
              <td>{v.name}</td>
              <td>{v.status}</td>
              <td>{v.hours_rendered}</td>
              <td>{v.signup_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventDetail;