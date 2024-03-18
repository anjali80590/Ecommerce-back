const mongoose = require("mongoose");

const { faker } = require("@faker-js/faker");
const Category = require("./model/category");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function generateCategories() {
  await Category.deleteMany({});

  for (let i = 0; i < 100; i++) {
    const categoryName = faker.commerce.department();
    await Category.create({ name: categoryName });
  }

  console.log("100 fake categories have been generated.");

  mongoose.connection.close();
}
generateCategories();
