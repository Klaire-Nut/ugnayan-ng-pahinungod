import React, { useState } from "react";
import {
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableSortLabel,
} from "@mui/material";

export default function AdminTable({ columns = [], rows = [], actions }) {
    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedRows = [...rows].sort((a, b) => {
        if (!sortField) return 0;
        const valA = a[sortField]?.toString().toLowerCase() ?? "";
        const valB = b[sortField]?.toString().toLowerCase() ?? "";

        if (sortDirection === "asc") return valA.localeCompare(valB);
        return valB.localeCompare(valA);
    });

    return (
        <Paper
            sx={{
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
            }}
        >
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell
                                key={col.field}
                                sx={{
                                backgroundColor: "#7b1d1d",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "15px",
                                cursor: "pointer",
                                }}
                                onClick={() => handleSort(col.field)}
                            >
                                <TableSortLabel
                                    active={sortField === col.field}
                                    direction={sortField === col.field ? sortDirection : "asc"}
                                    sx={{ color: "white !important" }}
                                >
                                    {col.header}
                                </TableSortLabel>
                            </TableCell>
                        ))}

                        {actions && (
                        <TableCell
                            sx={{
                            backgroundColor: "#7b1d1d",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "15px",
                            }}
                        >
                            Action
                        </TableCell>
                        )}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {sortedRows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length + 1} sx={{ textAlign: "center", py: 3 }}>
                                No registered volunteers yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedRows.map((row, i) => (
                        <TableRow key={i} hover>
                            {columns.map((col) => (
                                <TableCell key={col.field} sx={{ fontSize: "15px" }}>
                                    {row[col.field]}
                                </TableCell>
                            ))}
                            {actions && <TableCell>{actions(row)}</TableCell>}
                        </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
}
