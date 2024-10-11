// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const db = require('./db'); // Ensure this is correct and connects to your MongoDB

// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use the CORS middleware with specific origin
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
  credentials: true // Allow cookies to be sent with requests
}));

// Use the body-parser middleware
app.use(bodyParser.json()); // For parsing application/json


// Use the routers
app.use('/users', userRoutes);
app.use('/candidates', candidateRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the Voting App API');
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
