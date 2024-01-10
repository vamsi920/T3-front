import * as React from 'react';
import Box from '@mui/material/Box';
// import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';
// import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
// import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const icon = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20',  opacity: 0.6}} elevation={4}>
      <Paper sx={{ m: 1, p: 2, width: '80%', textAlign: 'center',backgroundColor: 'green', color:'white' }} >
        <Typography variant="body1">
          Create and saved to desktop.
        </Typography>
      </Paper>
    </div>
  );

export default icon;