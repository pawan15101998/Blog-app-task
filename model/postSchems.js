const mongoose = require('mongoose');

// Define a schema for the Post collection
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
    }],
    imageUrl: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model from the schema
const Post = mongoose.model('Post', postSchema);

module.exports = Post;