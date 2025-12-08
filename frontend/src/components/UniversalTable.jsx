// src/components/UniversalTable.jsx
import React from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";

export default function UniversalTable({ columns = [], rows = [], height = "400px", actions }) {
  return (
    <Paper
      sx={{
        padding: 2,
        maxHeight: height,
        overflowY: "auto",
        borderRadius: 2,
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.field}>
                <strong>{col.header}</strong>
              </TableCell>
            ))}

            {/* ACTION COLUMN IF PROVIDED */}
            {actions && <TableCell><strong>Action</strong></TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: "center" }}>
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={col.field}>
                    {row[col.field]}
                  </TableCell>
                ))}

                {/* Render action button if provided */}
                {actions && (
                  <TableCell>
                    <Box>{actions(row)}</Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
