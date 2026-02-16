const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// const hostname = "127.0.0.1";
// const port = 5000;
const port = process.env.PORT || 5000;

const mongooDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://abhishekmevada85_db_user:BLB17L3R1EmQuDyG@cluster0.vu1po2u.mongodb.net/?appName=Cluster0",
    );
    console.log("DB connected");
  } catch (error) {
    console.log(error);
  }
};

mongooDB();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  selstocks: { type: Number, required: true },
});

const Product = mongoose.model("Products", productSchema);

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "please filled all input field" });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    const hashpass = await bcrypt.hash(password, 10);

    const newuser = new User({ name, email, password: hashpass });
    await newuser.save();

    res.status(200).json({ message: "Signup Done" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Filled the Input Field" });
    }
    const existUser = await User.findOne({ email });

    if (!existUser) {
      return res.status(400).json({ message: "user not found" });
    }
    const pass = await bcrypt.compare(password, existUser.password);

    if (!pass) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res
      .status(200)
      .json({ message: "Login", name: existUser.name, userId: existUser._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/addproduct", async (req, res) => {
  const { userId, product, brand, category, stock, price, selstocks } =
    req.body;

  try {
    if (!product || !brand || !category || !stock || !price) {
      return res.status(400).json({ message: "Please filled the input field" });
    }

    const existingProduct = await Product.findOne({
      userId: userId,
      product: product,
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "This product already exists in your inventory" });
    }

    const newProduct = new Product({
      userId,
      product,
      brand,
      category,
      stock,
      price,
      selstocks,
    });

    await newProduct.save();

    res.status(200).json({ message: "Product Added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/product/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const product = await Product.find({ userId });

    if (product.length == 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/stocksupdate/:id", async (req, res) => {
  const { id } = req.params;
  const { stocksto } = req.body;
  try {
    const adstocks = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: stocksto } },
      { new: true },
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Stock updated successfully!",
      stock: adstocks.stock, // Send the new total back to the frontend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/stockssell/:id", async (req, res) => {
  const { id } = req.params;
  const { stockssell } = req.body;

  try {
    const sellstocksj = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -stockssell, selstocks: stockssell } },
      { new: true },
    );
    if (!sellstocksj) {
      return res.status(400).json({ message: "Product not Found" });
    }
    res.status(200).json({
      message: "Updated",
      stock: sellstocksj.stock,
      selstocks: sellstocksj.selstocks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/deletePro/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteaa = await Product.findByIdAndDelete(id);
    if (!deleteaa) {
      return res.status(400).json({ message: "Product not Found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// app.listen(port, hostname, () => {
//   console.log(`http://${hostname}:${port}`);
// });
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
