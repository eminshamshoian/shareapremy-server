import express from 'express';
import cors from 'cors';
import { readdirSync } from 'fs';
import mongoose from 'mongoose';
const morgan = require('morgan');
require('dotenv').config();

// Initialize express
const app = express();

// Database Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database Connection Established!');
  })
  .catch((error) => {
    console.error('Database Error ', error);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
readdirSync('./routes').map((r) => {
  app.use('/api', require(`./routes/${r}`));
});

// Port
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server running on port ${port}`));
