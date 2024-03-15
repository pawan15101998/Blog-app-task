const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Post = require('../model/postSchems');
const fs = require('fs');
require('dotenv').config();







cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function generateSlug(title) {
    return title
        .toLowerCase() 
        .replace(/\s+/g, '-') 
        .replace(/[^a-z0-9-]/g, '') 
        .replace(/-{2,}/g, '-'); 
}


router.post('/posts', upload.single('image'), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);

        if (req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        const slug = generateSlug(req.body.title);

        const newPost = new Post({
            title: req.body.title,
            description: req.body.description,
            shortDescription: req.body.shortDescription,
            tags: req.body.tags ? req.body.tags.split(',') : [],
            imageUrl: result.secure_url,
            slug: slug
        });

        await newPost.save();

        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post', details: error.message });
    }
});


router.get('/posts/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log(slug)
        const post = await Post.findOne({ slug });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get post', details: error.message });
    }
});

router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get posts', details: error.message });
    }
});


router.get('/post/search', async (req, res) => {
    try {
        const { query, page = 1, limit = 10, tags } = req.query;
        if ((!query || query.trim() === '') && !tags) {
            return res.status(400).json({ error: 'BAD_REQUEST', message: 'Search query or tags are required' });
        }
        const queryConditions = {};
        if (query && query.trim() !== '') {
            queryConditions.$or = [
                { title: { $regex: new RegExp(query, 'i') } },
                { description: { $regex: new RegExp(query, 'i') } }
            ];
        }
        if (tags) {
            queryConditions.tags = tags;
        }
        const totalCount = await Post.countDocuments(queryConditions);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {};

        if (endIndex < totalCount) {
            results.next = {
                page: page + 1,
                limit: limit
            };
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            };
        }
        results.results = await Post.find(queryConditions).limit(limit).skip(startIndex);
        if (results.results.length == 0) {
            return res.status(400).json({ error: 'BAD_REQUEST', message: 'Please enter a valid query' });
        } else {
            res.json(results);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to search posts', details: error.message });
    }
});

module.exports = router;
