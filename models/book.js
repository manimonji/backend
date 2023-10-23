const mongoose = require("mongoose");
const path = require("node:path");

const coverImageBasePath = "upload/book-covers";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },
    coverImageName: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Auhtor"
    }
});

bookSchema.virtual("coverImagePath").get(function() {
    return this.coverImageName ? path.join("/", coverImageBasePath, this.coverImageName) : '';
});

module.exports = mongoose.model('Book', bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;