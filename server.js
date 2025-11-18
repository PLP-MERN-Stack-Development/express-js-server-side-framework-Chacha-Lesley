// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

//Custom error classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

// Middleware setup
app.use(bodyParser.json());
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};
app.use(logger);

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};
app.use('/api', authenticate);

const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || typeof name !== 'string' ||
      !description || typeof description !== 'string' ||
      typeof price !== 'number' ||
      !category || typeof category !== 'string' ||
      typeof inStock !== 'boolean') {
    return res.status(400).json({ message: 'Validation failed: Invalid product fields' });
  }
  next();
};
app.use('/api/products', validateProduct);

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

//Handle async errors
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

//Get all products & filter by category with pagination
app.get('/api/products', (req, res) => {
  let filteredProducts = products;
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase());
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const paginated = filteredProducts.slice(start, start + limit);
  res.json({
    data: paginated,
    total: filteredProducts.length,
    page,
    limit
  });
});

//Search endpoint by name
app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    throw new ValidationError('Query parameter "q" is required');
  }
  const results = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  res.json(results);
});

//Product statistics route
app.get('/api/products/stats', (req, res) => {
  const stats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  res.json(stats);
});

// Get a specific product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Create a new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update a product by ID
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const updatedProduct = { ...products[index], ...req.body };
  products[index] = updatedProduct;
  res.json(updatedProduct);
});

// Delete a product by ID
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products.splice(index, 1);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app; 