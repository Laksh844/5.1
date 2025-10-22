// 1. Import Dependencies
const express = require('express');
const mongoose = require('mongoose');

// 2. Initialize Express App
const app = express();
const PORT = 3000;

// 3. Middleware to parse JSON bodies
app.use(express.json());

// 4. Connect to MongoDB
// Make sure your MongoDB server is running!
mongoose.connect('mongodb://localhost:27017/productDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('✅ Successfully connected to MongoDB!');
});

// 5. Define the Product Schema and Model
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
  },
});

const Product = mongoose.model('Product', productSchema);

// 6. Define API Routes (CRUD Operations)

// --- CREATE a new product (POST) ---
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct); // 201 Created
  } catch (error) {
    res.status(400).json({ message: error.message }); // 400 Bad Request
  }
});

// --- READ all products (GET) ---
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products); // 200 OK
  } catch (error) {
    res.status(500).json({ message: error.message }); // 500 Internal Server Error
  }
});

// --- UPDATE a product by ID (PUT) ---
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' }); // 404 Not Found
    }
    res.status(200).json(updatedProduct); // 200 OK
  } catch (error) {
    res.status(400).json({ message: error.message }); // 400 Bad Request
  }
});

// --- DELETE a product by ID (DELETE) ---
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' }); // 404 Not Found
    }
    // Respond with a custom message and the deleted product object
    res.status(200).json({
      message: 'Product deleted',
      product: deletedProduct,
    }); // 200 OK
  } catch (error) {
    res.status(500).json({ message: error.message }); // 500 Internal Server Error
  }
});


// 7. Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});