// backend/db.js
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://siridevojunew:d12cSFl5OH3cq5HS@freecluster.9tdpxij.mongodb.net/contactsdb?retryWrites=true&w=majority&appName=freecluster'; // or your Atlas URI

// Connect to MongoDB
async function init() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected:', MONGO_URI);
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

// Define schema
const contactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

const Contact = mongoose.model('Contact', contactSchema);

// CRUD helpers
async function addContact({ name, email, phone }) {
    const contact = new Contact({ name, email, phone });
    await contact.save();
    return contact;
}

async function getContacts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return Contact.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
}

async function getCount() {
    return Contact.countDocuments();
}

async function deleteContact(id) {
    return Contact.findByIdAndDelete(id);
}

module.exports = { init, addContact, getContacts, getCount, deleteContact };
