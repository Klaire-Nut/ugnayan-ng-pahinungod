import React, { useState, useEffect } from "react";
import "../../styles/EventModal.css";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUserFriends,
} from "react-icons/fa";

export default function EventCreateModal({
  open = false,
  mode = "create",
  eventData = null,
  onCreate = () => {},
  onUpdate = () => {},
  onClose = () => {},
}) {
  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState({
    event_name: "",
    description: "",
    location: "",
    schedules: [],
  });

  useEffect(() => {
    if (mode === "edit" && eventData) {
      setForm({
        event_name: eventData.event_name,
        description: eventData.description,
        location: eventData.location,

        schedules:
          eventData.schedules?.length > 0
            ? eventData.schedules.map((s) => ({
                date: s.date,
                start_time: s.start_time,
                end_time: s.end_time,
                max_slots: s.max_slots ?? 10,
              }))
            : [
                {
                  date: "",
                  start_time: "08:00",
                  end_time: "12:00",
                  max_slots: 10,
                },
              ],
      });
    } else {
      setForm({
        event_name: "",
        description: "",
        location: "",
        schedules: [
          {
            date: "",
            start_time: "08:00",
            end_time: "12:00",
            max_slots: 10,
          },
        ],
      });
    }
  }, [mode, eventData]);

  if (!open) return null;

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateSchedule = (index, field, value) => {
    const updated = [...form.schedules];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, schedules: updated }));
  };

  const addSchedule = () =>
    setForm((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        {
          date: "",
          start_time: "08:00",
          end_time: "12:00",
          max_slots: 10,
        },
      ],
    }));

  const removeSchedule = (index) =>
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "create") onCreate(form);
    else onUpdate(eventData.event_id, form);
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-container modal-lg animate-scale" onSubmit={handleSubmit}>
        
        {/* HEADER */}
        <div className="modal-header">
          <h2>{mode === "create" ? "Create Event" : "Edit Event"}</h2>
          <button className="close-btn" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {/* TAB BUTTONS */}
        <div className="modal-tabs">
          <button
            type="button"
            className={activeTab === "basic" ? "tab active" : "tab"}
            onClick={() => setActiveTab("basic")}
          >
            Basic Information
          </button>

          <button
            type="button"
            className={activeTab === "schedule" ? "tab active" : "tab"}
            onClick={() => setActiveTab("schedule")}
          >
            Schedule
          </button>
        </div>

        <div className="modal-body">
          {/* -------------------- BASIC INFO -------------------- */}
          {activeTab === "basic" && (
            <div className="form-grid-2col">
              <div className="floating form-group">
                <input
                  placeholder=" "
                  value={form.event_name}
                  onChange={(e) => updateField("event_name", e.target.value)}
                />
                <label>Event Name</label>
                <FaCalendarAlt className="input-icon" />
              </div>

              <div className="floating form-group">
                <input
                  placeholder=" "
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                />
                <label>Location</label>
                <FaMapMarkerAlt className="input-icon" />
              </div>

              <div className="floating form-group full-width">
                <textarea
                  placeholder=" "
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
                <label>Description</label>
              </div>
            </div>
          )}

          {/* -------------------- SCHEDULE TAB -------------------- */}
          {activeTab === "schedule" && (
            <div>
              <h3 className="section-title">Event Schedules</h3>

              {form.schedules.map((sched, index) => (
                <div className="schedule-card" key={index}>
                  <div className="schedule-header">
                    <h4>Day {index + 1}</h4>
                    <button
                      type="button"
                      className="btn-remove-sched"
                      onClick={() => removeSchedule(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="schedule-grid">
                    <div className="floating form-group">
                      <input
                        type="date"
                        placeholder=" "
                        value={sched.date}
                        onChange={(e) => updateSchedule(index, "date", e.target.value)}
                      />
                      <label>Date</label>
                      <FaCalendarAlt className="input-icon" />
                    </div>

                    <div className="floating form-group">
                      <input
                        type="time"
                        placeholder=" "
                        value={sched.start_time}
                        onChange={(e) => updateSchedule(index, "start_time", e.target.value)}
                      />
                      <label>Start Time</label>
                      <FaClock className="input-icon" />
                    </div>

                    <div className="floating form-group">
                      <input
                        type="time"
                        placeholder=" "
                        value={sched.end_time}
                        onChange={(e) => updateSchedule(index, "end_time", e.target.value)}
                      />
                      <label>End Time</label>
                      <FaClock className="input-icon" />
                    </div>

                    <div className="floating form-group">
                      <input
                        type="number"
                        min={1}
                        placeholder=" "
                        value={sched.max_slots}
                        onChange={(e) =>
                          updateSchedule(index, "max_slots", Number(e.target.value))
                        }
                      />
                      <label>Max Slots for This Day</label>
                      <FaUserFriends className="input-icon" />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="btn-add-sched" onClick={addSchedule}>
                + Add Another Day
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="btn-cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" type="submit">
            {mode === "create" ? "Create Event" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}