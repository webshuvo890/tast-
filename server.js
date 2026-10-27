const express = require('express');
const app = express();

app.use(express.json());
// Serve static HTML/CSS/JS files from the "public" folder
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUvXtUAEBVM_fjRiDuH1i3SMii3vD0oVMIVeCS1Fnk7PZ3hznxpXD0GEK5jpQqNpGx/exec';

// 1. GET: Fetch from Google Sheets
app.get('/api/tools', async (req, res) => {
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=read`);
    const sheetData = await response.json();

    res.json({
      success: true,
      source: 'Google Sheets Database',
      totalItems: sheetData.data ? sheetData.data.length : 0,
      data: sheetData.data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data from Google Sheets',
      error: error.message
    });
  }
});

// 2. POST: Append new row to Google Sheets
app.post('/api/tools', async (req, res) => {
  const newToolData = req.body;

  if (!newToolData.name || !newToolData.department) {
    return res.status(400).json({
      success: false,
      message: 'Name and Department are required!'
    });
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newToolData.name,
        department: newToolData.department,
        stock: newToolData.stock || 0
      }),
      redirect: 'follow'
    });

    const result = await response.json();

    res.status(201).json({
      success: true,
      message: 'Tool saved directly into Google Sheets!',
      details: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to write data to Google Sheets',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server connected to Google Sheets running at http://localhost:${PORT}`);
});