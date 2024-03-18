const Category = require("../model/category"); // Update the path as necessary
const User = require("../model/user");

exports.getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const categories = await Category.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories / limit);

    res.json({ categories, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.markInterest = async (req, res) => {
  const { categoryId, toggleComplete } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: "No user ID provided" });
  }
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const interestIndex = user.interestedCategories.indexOf(categoryId);
    if (interestIndex > -1) {
      user.interestedCategories.splice(interestIndex, 1);
    } else {
      user.interestedCategories.push(categoryId);
    }

    if (toggleComplete) {
      category.completed = !category.completed;
      await category.save();
    }

    await user.save();
    res.status(200).json({
      message: "Interest and completion status updated",
      interests: user.interestedCategories,
      categoryCompleted: category.completed,
    });
  } catch (error) {
    console.error("Error updating interest: ", error);
    res
      .status(500)
      .json({ message: "Error updating interest", error: error.message });
  }
};
exports.getUserInterests = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: "No user ID provided" });
  }

  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("interestedCategories");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const interestIds = user.interestedCategories.map((category) =>
      category._id.toString()
    );

    res.status(200).json(interestIds); // Send array of interest IDs
  } catch (error) {
    console.error("Error fetching user interests: ", error);
    res
      .status(500)
      .json({ message: "Error fetching user interests", error: error.message });
  }
};
