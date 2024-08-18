const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI; // Ensure this is correct

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
    const BookCollection = client.db("Book_Nest").collection("Book-items");

    // API for finding items with pagination and searching
    app.get("/BookItems", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search || "";
      const category = req.query.category || "";

      try {
        const query = {};
        if (search) {
          query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        if (category) {
          query.category = category;
        }

        const [books, total] = await Promise.all([
          BookCollection.find(query).skip(skip).limit(limit).toArray(),
          BookCollection.countDocuments(query)
        ]);

        res.json({
          books,
          totalPages: Math.ceil(total / limit),
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
      }
    });

  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Book Nest is ready for you man");
});

app.listen(port, () => {
  console.log(`BookNest server is running on port : ${port}`);
});
