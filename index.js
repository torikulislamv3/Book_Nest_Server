const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send("book nest is ready for you")
})

app.listen(port, ()=>{
    console.log(`booknest server is running on port : ${port}`)
})