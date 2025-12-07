import React, { useState, useEffect } from "react";
import "../../styles/EventModal.css";

export default function EventCreateModal({
  mode = "create",
  eventData = null,
  onCreate,
  onUpdate,
  onClose,
}) {
  const [form, setForm] = useState({
    event_name: "",
    description: "",
    location: "",
    volunteers_needed: 1,
    days: [],
  });

  const [dayInputMode, setDayInputMode] = useState("byCount");
  const [dayCount, setDayCount] = useState(1);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  
  const [errors, setErrors] = useState(null); 
  const [loading, setLoading] = useState(false); 
  
  useEffect(() => {
    if (mode === "edit" && eventData) {
      setForm({
        event_name: eventData.event_name,
        description: eventData.description,
        location: eventData.location,
        volunteers_needed: eventData.volunteers_needed,
        days: eventData.schedules.map((s) => ({
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      });

      setDayCount(eventData.schedules.length);
      setRangeStart(eventData.schedules[0].date);
      setRangeEnd(eventData.schedules[eventData.schedules.length - 1].date);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setForm((f) => ({
        ...f,
        days: [{ date: today, start_time: "08:00", end_time: "12:00" }],
      }));
      setRangeStart(today);
      setRangeEnd(today);
    }
  }, [mode, eventData]);

  const updateField = (name, value) =>
    setForm((f) => ({ ...f, [name]: value }));

  const updateDay = (index, field, value) => {
    const updated = [...form.days];
    updated[index][field] = value;
    setForm((f) => ({ ...f, days: updated }));
  };

  const generateDaysFromCount = (count, baseDate) => {
    const base = new Date(baseDate);
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return {
        date: d.toISOString().slice(0, 10),
        start_time: "08:00",
        end_time: "12:00",
      };
    });
  };

  const generateDaysFromRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const days = [];

    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      days.push({
        date: d.toISOString().slice(0, 10),
        start_time: "08:00",
        end_time: "12:00",
      });
    }
    return days;
  };

  useEffect(() => {
    if (dayInputMode === "byCount") {
      if (!rangeStart) return;
      setForm((f) => ({
        ...f,
        days: generateDaysFromCount(dayCount, rangeStart),
      }));
    }
  }, [dayCount, dayInputMode, rangeStart]);

  useEffect(() => {
    if (dayInputMode === "byRange" && rangeStart && rangeEnd) {
      const days = generateDaysFromRange(rangeStart, rangeEnd);
      setForm((f) => ({ ...f, days }));
      setDayCount(days.length);
    }
  }, [rangeStart, rangeEnd, dayInputMode]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);

    // Convert volunteers_needed to number safely
    const maxParticipants = parseInt(form.volunteers_needed, 10);

      if (isNaN(maxParticipants) || maxParticipants <= 0) {
        setErrors({
          max_participants: ["Please enter a positive whole number of volunteers."]
        });
        setLoading(false);
        return;
      }


    // Prepare schedules
    const schedules = form.days.map(d => ({
      day: d.date,        // backend expects 'day'
      start_time: d.start_time,
      end_time: d.end_time,
    }));

    // Build payload
    const payload = {
      event_name: form.event_name,
      description: form.description,
      location: form.location,
      max_participants: maxParticipants > 0 ? maxParticipants : 1,
      schedules: schedules,
      date_start: `${form.days[0].date}T${form.days[0].start_time}`,
      date_end: `${form.days[form.days.length - 1].date}T${form.days[form.days.length - 1].end_time}`,
    };

    console.log("Sending event data to backend:", payload);

    try {
      if (mode === "create") {
        await onCreate(payload);
      } else {
        await onUpdate({ ...payload, id: eventData.id });
      }
      onClose();
    } catch (err) {
      console.error("DRF returned validation errors:", err?.response?.data);
      setErrors(err?.response?.data || { detail: "Something went wrong." });
    }

    setLoading(false);
  };


  const addDay = () => {
    setForm((f) => ({
      ...f,
      days: [...f.days, { date: "", start_time: "08:00", end_time: "12:00" }],
    }));
  };

  const removeDay = (index) => {
    setForm((f) => ({
      ...f,
      days: f.days.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-container animate-scale" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>{mode === "create" ? "Create Event" : "Edit Event"}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Event Title</label>
            <input
              value={form.event_name}
              onChange={(e) => updateField("event_name", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Volunteers Needed</label>
            <input
              type="number"
              value={form.volunteers_needed}
              onChange={(e) =>
                updateField("volunteers_needed", e.target.value)
              }
            />
          </div>

          <h3>Daily Schedules</h3>

          {form.days.map((day, i) => (
            <div className="day-row" key={i}>
              <input
                type="date"
                value={day.date}
                onChange={(e) => updateDay(i, "date", e.target.value)}
              />
              <input
                type="time"
                value={day.start_time}
                onChange={(e) => updateDay(i, "start_time", e.target.value)}
              />
              <input
                type="time"
                value={day.end_time}
                onChange={(e) => updateDay(i, "end_time", e.target.value)}
              />

              <button type="button" onClick={() => removeDay(i)}>
                Remove
              </button>
            </div>
          ))}

          <button type="button" onClick={addDay}>
            + Add Day
          </button>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-confirm">
            {mode === "create" ? "Create Event" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
