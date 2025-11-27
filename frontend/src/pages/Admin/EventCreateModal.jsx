import React, { useState } from "react";
import "./../../styles/EventModal.css";

export default function EventCreateModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    location: "",
    date_start: "",
    date_end: "",
    volunteers_needed: 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!onCreate) {
      console.error("❌ ERROR: onCreate PROP NOT PASSED TO MODAL");
      return;
    }

    onCreate(formData); // send data UP to AdminEvents
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container animate-scale">

        <div className="modal-header">
          <h2>Create New Event</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">

          <div className="form-group">
            <label>Event Title</label>
            <input 
              name="event_name"
              placeholder="Enter event name"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Write a short description..."
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input 
              name="location"
              placeholder="Enter venue"
              onChange={handleChange}
            />
          </div>

          <div className="form-inline">
            <div>
              <label>Start Time</label>
              <input 
                type="datetime-local" 
                name="date_start"
                onChange={handleChange} 
              />
            </div>

            <div>
              <label>End Time</label>
              <input 
                type="datetime-local" 
                name="date_end"
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Volunteers Needed</label>
            <input 
              type="number"
              min="1"
              name="volunteers_needed"
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={handleSubmit}>Create Event</button>
        </div>

      </div>
    </div>
  );
}
