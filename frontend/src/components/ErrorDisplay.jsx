// src/components/ErrorDisplay.jsx
import React from 'react';
import { Alert, AlertTitle, Box, List, ListItem, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * ErrorDisplay Component
 * Displays errors in a user-friendly format
 * 
 * @param {string|object} error - Error message or error object with field-specific errors
 * @param {function} onClose - Callback when alert is closed
 */
export default function ErrorDisplay({ error, onClose }) {
  if (!error) return null;

  // Handle string errors
  if (typeof error === 'string') {
    return (
      <Alert 
        severity="error" 
        onClose={onClose}
        sx={{ mb: 3 }}
        icon={<ErrorOutlineIcon />}
      >
        <AlertTitle>Registration Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  // Handle object errors with multiple fields
  if (typeof error === 'object') {
    const errorEntries = Object.entries(error);
    
    if (errorEntries.length === 0) return null;

    return (
      <Alert 
        severity="error" 
        onClose={onClose}
        sx={{ mb: 3 }}
        icon={<ErrorOutlineIcon />}
      >
        <AlertTitle>Please fix the following errors:</AlertTitle>
        <List dense sx={{ mt: 1 }}>
          {errorEntries.map(([field, messages]) => {
            const fieldName = field
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            const errorMessages = Array.isArray(messages) ? messages : [messages];
            
            return (
              <ListItem key={field} sx={{ pl: 0 }}>
                <Typography variant="body2">
                  <strong>{fieldName}:</strong> {errorMessages.join(', ')}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      </Alert>
    );
  }

  return null;
}