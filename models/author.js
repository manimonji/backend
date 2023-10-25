const mongoose = require("mongoose");
const Book = require("./book");

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

authorSchema.pre("deleteOne", { document: true } ,function(next){
    Book.find({ author: this.id }).then((err, books) => {
        if (err && err != 0) next(err)
        else if (books && books.length > 0) {
            next(new Error("This author has books still."));
        } else{
            next();
        }
    });
});

module.exports = mongoose.model('Author', authorSchema)