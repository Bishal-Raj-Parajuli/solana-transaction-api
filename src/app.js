
import express from 'express';
import transactionRoute from './routes/transactionRoute.js';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set default headers for JSON responses
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// app.use("/api_docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', transactionRoute);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});