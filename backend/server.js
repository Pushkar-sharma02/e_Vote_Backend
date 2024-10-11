const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const db = require('./db');
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use(cors({
  origin: 'https://e-votegov.netlify.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly list all methods
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // Explicitly allow necessary headers
}));

app.use(bodyParser.json());


app.options('*', cors());

app.use('/users', userRoutes);
app.use('/candidates', candidateRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Voting App API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});