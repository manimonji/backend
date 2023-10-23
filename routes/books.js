const express = require("express");
const router = express.Router();
const path = require("node:path");
const fs = require("node:fs");
const multer = require("multer");
const Book = require("../models/book");
const uploadPath = path.join('public', Book.coverImageBasePath)
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png"]
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

router.get("/", async (req, res) => {
    let query = Book.find();
    if (req.query.title && req.query.title != '') {
        query = query.regex("title",new RegExp(req.query.title, "i"));
    }
    if (req.query.publishDate && req.query.publishDate != '') {
        query = query.where("publishDate").equals(req.query.publishDate);
    }
    try {
        const books = await query.exec();
        res.render("books/index", {
            books: books,
            searchOptions: req.query
        });
    } catch(err) {
        console.log(err);
        res.redirect("/");
    }
});

router.get("/new", async (req, res) => {
    renderNewPage(res, new Book());
});

router.post("/", upload.single("cover"), async (req, res) => {
    const fileName = req.file ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    });
    try {
        const newBook = await book.save();
        res.redirect("books")
    } catch {
        removeBookCover(fileName);
        renderNewPage(res, book, true)
    }
});

const removeBookCover = (fileName) => {
    if (fileName != null) {
        fs.unlink(path.join(uploadPath, fileName), err => console.err(err));
    }
}

const renderNewPage = async (res, book, hasError = false) => {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError) params.errorMessage = 'Error Creating Book.'
        res.render("books/new", params);
    } catch(err) {
        res.redirect("/books");
    }
}

module.exports = router;
