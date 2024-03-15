const { MongoClient } = require('mongodb');
const express = require('express');
const mongoose = require('mongoose');
const postRoutes = require('./controller/postController');
const cors = require('cors');



const app = express();

app.use(cors());
const uri = process.env.MONGO_URl; // Connection URI
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Hurry Database Connected'));


app.use(express.json());
app.use('/api',cors(), postRoutes);

app.get('/',(req, res) => {
    res.send('Hello World');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



