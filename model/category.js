const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

categorySchema.methods.toggleCompleted = function () {
  this.completed = !this.completed;
  return this.save();
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
