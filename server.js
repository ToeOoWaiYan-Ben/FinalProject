// server.js
const express = require('express');
const mongoose = require('mongoose');
const formidable = require('formidable');
const Auction = require('./models/Auction'); // Adjust the path to your Auction model
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/your-db-name', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Handle file uploads and auction creation
app.post('/api/auctions', (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = uploadsDir; // Set upload directory
    form.keepExtensions = true; // Keep file extension

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Form parsing error:', err);
            return res.status(500).json({ message: 'File upload failed', error: err.message });
        }

        console.log('Fields:', fields); // Log form fields
        console.log('Files:', files); // Log uploaded files

        try {
            const { name, description, creator } = fields;

            // Validate required fields
            if (!name || !description || !creator) {
                return res.status(400).json({ message: 'Name, description, and creator ID are required' });
            }

            // Create a new auction entry
            const auction = new Auction({
                auctionId: new mongoose.Types.ObjectId().toString(),
                name,
                description,
                creator,
                photo: files.photo ? `/uploads/${files.photo.newFilename}` : null, // Store file path
            });

            await auction.save();
            res.status(201).json({ message: 'Auction created successfully', auction });
        } catch (error) {
            console.error('Error creating auction:', error);
            res.status(500).json({ message: 'Failed to create auction', error: error.message });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
