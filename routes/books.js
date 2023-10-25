const express = require("express");
const router = express.Router();
const path = require("node:path");
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png"];

router.get("/", async (req, res) => {
    let query = Book.find();
    if (req.query.title && req.query.title != '') {
        query = query.regex("title", new RegExp(req.query.title, "i"));
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
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
});

router.get("/new", (req, res) => {
    renderFormPage(res, new Book(), "new");
});

router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate("author").exec();
        res.render("books/show", { book: book });
    } catch(err) {
        console.log(err);
        res.redirect("/");
    }
});

router.get("/:id/edit", async (req, res) => {
    const book = await Book.findById(req.params.id);
    renderFormPage(res, book, "edit");
});


router.post("/", async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
    saveCover(book, req.body.cover);
    try {
        const newBook = await book.save();
        res.redirect("books")
    } catch (err) {
        console.log(err);
        renderFormPage(res, book, "new", true);
    }
});

router.put("/:id", async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        saveCover(book, req.body.cover);
        await book.save();
        res.redirect("books");
    } catch (err) {
        console.log(err, "bro what");
        renderFormPage(res, book, "new", true);
    }
});

router.delete("/:id", async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.deleteOne();
        res.redirect("/books")
    } catch (err) {
        console.log(err);
        res.redirect(`/books/${book.id}`)
    }
});

const saveCover = (book, encodedCover) => {
    const cover = JSON.parse(encodedCover);
    if (encodedCover && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, "base64");
        book.coverImageType = cover.type;
    }
};

const renderFormPage = async (res, book, form, hasError = false) => {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError) params.errorMessage = `Error ${form == "new" ? "Creating" : "Updating"} Book.`
        res.render(`books/${form}`, params);
    } catch (err) {
        res.redirect("/books");
    }
}

module.exports = router;
