const express = require("express");
const router = express.Router();
const Book = require("../models/book");

router.get("/", async (req, res) => {
    try {
        const books = await Book.find().sort({createdAt: 'desc'}).limit(10).exec();
        res.render("index", {books: books, cssFiles: ["index.css"]});
    } catch(err) {
        console.log(`c% ${err}`, "color: red;");
        books = [];
    }
});

module.exports = router;
