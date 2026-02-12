let mongoose = require('mongoose');

let ExerciseSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is required"],
        uppercase: true
    },
    category: {
        type: String,
        required: [true, "category is required"],
        uppercase: true
    },
    mainImage: {
        type: String,
        required: [true, "main image is required"],
    },
    definitionImage: {
        type: String,
        required: [true, "definition image is required"],
    },
    definitionText: {
        type: String,
        required: [true, "definition text is required"],
        uppercase: true
    },
    ampliationImages: {
        type: [String],
        required: [true, "ampliation images is required"],
        uppercase: true
    },
    ampliationText: {
        type: [String],
        required: [true, "ampliation text is required"],
        uppercase: true
    },
    definitionPictogram: {
        type: String,
        required: [true, "definition pictogram is required"]
    },
    ampliationPictogram: {
        type: String,
        required: [true, "ampliation pictogram is required"]
    },
    networkType: {
        type: String,
        required: [true, "network type is required"],
        uppercase: true
    },
    representation: {
        type: String,
        required: [true, "representation is required"],
        uppercase: true
    },
    language: {
        type: String,
        required: [true, "language is required"],
        lowercase: true
    },
    teacherId: {
        type: String
    }
});

let Exercise = mongoose.model("Exercise", ExerciseSchema);

module.exports = Exercise;