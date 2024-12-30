const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Increase payload size limits - adjust these values based on your needs
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ message: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb'
}));

app.use(express.static(path.join(__dirname, '/')));

// Helper function to ensure directory exists
const ensureDirectoryExists = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

app.post('/append-data', (req, res) => {
  const newData = req.body;
  const filePath = path.join(__dirname, 'stationsData.json');
  
  console.log("Received request with data size:", JSON.stringify(newData).length);
  console.log("Processing file at:", filePath);

  try {
    ensureDirectoryExists(filePath);

    // Create file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ stations: [], distances: [] }, null, 2));
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error("File read error:", err);
        return res.status(500).json({ 
          message: 'Failed to read file',
          error: err.message 
        });
      }

      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return res.status(500).json({ 
          message: 'Failed to parse JSON data',
          error: parseError.message 
        });
      }

      // Initialize arrays if they don't exist
      if (!jsonData.stations) jsonData.stations = [];
      if (!jsonData.distances) jsonData.distances = [];

      // Validate incoming data
      if (!Array.isArray(newData.stations) || !Array.isArray(newData.distances)) {
        return res.status(400).json({ 
          message: 'Invalid data format. Expected arrays for stations and distances.' 
        });
      }

      // Append new data
      jsonData.stations.push(...newData.stations);
      jsonData.distances.push(...newData.distances);

      // Write back to file
      fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error("File write error:", writeErr);
          return res.status(500).json({ 
            message: 'Failed to write file',
            error: writeErr.message 
          });
        }
        res.json({ 
          message: 'Data successfully appended to stationsData.json',
          dataSize: JSON.stringify(jsonData).length
        });
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Max payload size set to 50MB`);
});