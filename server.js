const express = require('express');
const path = require('path');

const app = express();
const port = 3001;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the root path to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
