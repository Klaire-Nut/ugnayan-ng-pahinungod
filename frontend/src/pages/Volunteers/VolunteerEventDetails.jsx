import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Typography,
    Chip,
    Box,
    Button,
} from "@mui/material";

import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaUserFriends,
} from "react-icons/fa";

import EventJoinModal from "../Volunteers/EventJoinModal";

/* ----------------------------------------
   HELPERS
---------------------------------------- */

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};

function computeStatus(event) {
    const schedules = event.schedules || [];

    if (event.is_cancelled) return "CANCELLED";
    if (!schedules.length) return "UPCOMING";

    const now = new Date();
    const first = schedules[0];
    const last = schedules[schedules.length - 1];

    const start = new Date(`${first.date}T${first.start_time || first.time_start}`);
    const end = new Date(`${last.date}T${last.end_time || last.time_end}`);

    if (now < start) return "UPCOMING";
    if (now >= start && now <= end) return "HAPPENING";
    return "DONE";
}

const statusColors = {
    UPCOMING: "primary",
    HAPPENING: "success",
    DONE: "info",
    CANCELLED: "error",
};

/* ----------------------------------------
   COMPONENT
---------------------------------------- */

export default function VolunteerEventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [event, setEvent] = useState(null);
    const [joined, setJoined] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            const res = await fetch(
                `http://localhost:8000/api/events/volunteer/events/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            setEvent(data);
            setJoined(data.volunteer_status?.is_joined === true);
        };
        load();
    }, [id, token]);

    if (!event) return <p>Loading...</p>;

    const schedules = event.schedules || [];
    const status = computeStatus(event);

    return (
        <Box sx={{ maxWidth: "1100px", mx: "auto", mt: 3, pb: 8 }}>

            {/* BACK BUTTON */}
            <Button
                startIcon={<FaArrowLeft />}
                onClick={() => navigate(-1)}
                sx={{
                    mb: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#444",
                }}
            >
                Back
            </Button>

            {/* HEADER (matched to admin) */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {event.event_name}
                    </Typography>

                    <Chip
                        label={
                            event.is_cancelled
                                ? "CANCELLED"
                                : joined
                                ? "JOINED"
                                : event.is_full
                                ? "FULL"
                                : status
                        }
                        color={
                            event.is_cancelled
                                ? "error"
                                : joined
                                ? "success"
                                : event.is_full
                                ? "warning"
                                : statusColors[status]
                        }
                        sx={{
                            fontWeight: 700,
                            px: 1,
                            borderRadius: "6px",
                        }}
                        size="small"
                    />

                    {event.is_cancelled && (
                        <Typography sx={{ mt: 1, color: "error.main", fontWeight: 700 }}>
                            This event is CANCELLED.
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* EVENT INFORMATION */}
            <Card sx={{ mb: 4, borderRadius: 3, p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Event Information
                </Typography>

                {/* LOCATION */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <FaMapMarkerAlt size={17} color="#9b1c1c" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: "1rem", color: "#444" }}>
                        {event.location}
                    </Typography>
                </Box>

                {/* DESCRIPTION */}
                <Typography sx={{ color: "#555", lineHeight: 1.6 }}>
                    {event.description || "No description provided."}
                </Typography>
            </Card>

            {/* SCHEDULE SECTION (matched to admin layout) */}
            <Card sx={{ mb: 4, borderRadius: 3, p: 2.5 }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center" }}
                >
                    <FaCalendarAlt size={18} color="#9b1c1c" style={{ marginRight: 10 }} />
                    Event Schedule
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
                    {schedules.map((sch, i) => {
                        const slotsTaken = sch.filled_slots || sch.slots_taken || 0;
                        const maxSlots = sch.max_slots || 0;
                        const remaining = maxSlots - slotsTaken;

                        return (
                            <Box
                                key={i}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: "1px solid #e2e2e2",
                                    background: "#fafafa",
                                }}
                            >
                                {/* HEADER */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 1,
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 700 }}>
                                        Day {i + 1}
                                    </Typography>

                                    {/* SLOT BADGE (same look as admin) */}
                                    <Chip
                                        label={
                                            remaining > 0
                                                ? `${remaining} slots left`
                                                : "FULL"
                                        }
                                        size="small"
                                        color={remaining > 0 ? "primary" : "error"}
                                        sx={{ fontWeight: 700 }}
                                    />
                                </Box>

                                {/* DATE */}
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <FaCalendarAlt
                                        size={14}
                                        color="#ac7373ff"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Typography>{formatDate(sch.date)}</Typography>
                                </Box>

                                {/* TIME */}
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <FaClock
                                        size={14}
                                        color="#7b1d1d"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Typography>
                                        {formatTime(sch.start_time)} – {formatTime(sch.end_time)}
                                    </Typography>
                                </Box>

                                {/* SLOTS */}
                                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                    <FaUserFriends
                                        size={14}
                                        color="#7b1d1d"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>
                                        Slots: <strong>{slotsTaken}</strong> /{" "}
                                        <strong>{maxSlots}</strong>
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Card>

            {/* JOIN SECTION (replaces admin volunteer table) */}
            {!event.is_cancelled && (
                <Card sx={{ borderRadius: 3, p: 2.5 }}>
                    <Button
                        disabled={joined || event.is_full}
                        variant="contained"
                        color={joined ? "success" : "primary"}
                        onClick={() => setJoinOpen(true)}
                        fullWidth
                        sx={{ py: 1.2, fontWeight: 700 }}
                    >
                        {joined ? "VOLUNTEERED ✓" : event.is_full ? "EVENT FULL" : "VOLUNTEER FOR THIS EVENT"}
                    </Button>

                    <EventJoinModal
                        open={joinOpen}
                        onClose={() => setJoinOpen(false)}
                        schedules={schedules}
                        onConfirm={async (selected) => {
                            const res = await fetch(
                                "http://localhost:8000/api/events/volunteer/events/join/",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        event: event.event_id,
                                        schedules: selected,
                                        availability_orientation: false,
                                    }),
                                }
                            );

                            if (res.ok) {
                                alert("Successfully volunteered!");
                                setJoined(true);
                                setJoinOpen(false);
                            } else {
                                const err = await res.json();
                                alert(err.error || "Failed to volunteer.");
                            }
                        }}
                    />
                </Card>
            )}
        </Box>
    );
}
