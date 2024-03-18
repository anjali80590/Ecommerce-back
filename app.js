require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const { faker } = require('@faker-js/faker');

// Import routes
const userRoutes = require('./route/authRoutes');
const categoryRoutes = require('./route/categoryRoutes');

// Category model
const Category = require('./model/category');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const args = process.argv.slice(2);

// Function to generate fake categories
async function generateCategories() {
  await Category.deleteMany({});
  for (let i = 0; i < 100; i++) {
    const categoryName = faker.commerce.department();
    await Category.create({ name: categoryName });
  }
  console.log('100 fake categories have been generated.');
  mongoose.connection.close();
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

const PORT = process.env.PORT || 4000;

// Decide action based on command-line argument
if (args.includes('--seed')) {
  generateCategories();
} else {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
