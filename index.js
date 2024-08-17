const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI; // Use environment variable for MongoDB URI

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const BookCollection = client.db("Book_Nest").collection("Book-items");

    // API for finding books with pagination and filtering
    app.get("/BookItems", async (req, res) => {
      const { page = 1, limit = 10, category = "", search = "", sort = "" } = req.query;
      const skip = (page - 1) * limit;

      const query = {};
      if (category) {
        query.category = category;
      }
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      const sortOptions = {};
      if (sort === "Low to High") {
        sortOptions.price = 1;
      } else if (sort === "High to Low") {
        sortOptions.price = -1;
      } else if (sort === "Newest first") {
        sortOptions.publishedDate = -1;
      }

      const totalBooks = await BookCollection.countDocuments(query);
      const books = await BookCollection.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit)).toArray();

      res.json({
        books,
        totalPages: Math.ceil(totalBooks / limit),
      });
    });

  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Book Nest is ready for you");
});

app.listen(port, () => {
  console.log(`Book Nest server is running on port: ${port}`);
});
