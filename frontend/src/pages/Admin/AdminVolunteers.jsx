import React, { useState } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export default function AdminVolunteers() {
  const [volunteers] = useState([
    { id: 1, name: "Juan Dela Cruz", email: "juan@example.com", contact: "09123456789" },
    { id: 2, name: "Maria Santos", email: "maria@example.com", contact: "09987654321" },
  ]);

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Volunteers
      </Typography>

      <Paper sx={{ padding: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {volunteers.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.email}</TableCell>
                <TableCell>{v.contact}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
