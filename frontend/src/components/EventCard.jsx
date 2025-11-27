import React from "react";
import "../styles/EventCard.css";
import { MdEdit, MdDelete } from "react-icons/md";

export default function EventCard({ event, onEdit, onDelete }) {
  return (
    <div className="event-card">

      <div className="event-card-header">
        <h3>{event.event_name}</h3>

        <div className="event-actions">
          <button className="edit-btn" onClick={() => onEdit(event)}>
            <MdEdit size={18} />
          </button>

          <button className="delete-btn" onClick={() => onDelete(event.id)}>
            <MdDelete size={18} />
          </button>
        </div>
      </div>

      <p className="event-location">📍 {event.location}</p>

      <p><strong>Start:</strong> {event.date_start}</p>
      <p><strong>End:</strong> {event.date_end}</p>

      <p className="event-volunteers">
        👥 Volunteers Needed: {event.volunteers_needed}
      </p>

    </div>
  );
}
