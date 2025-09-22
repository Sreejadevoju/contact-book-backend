const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db, addContact, getContacts, getCount, deleteContact, init } = require('./db');

init();

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.post('/contacts', async (req, res) => {
    try {
        const contact = await addContact(req.body);
        res.status(201).json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/contacts', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const contacts = await getContacts(page, limit);
        const total = await getCount();
        res.json({
            contacts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/contacts/:id', async (req, res) => {
    try {
        await deleteContact(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log('Server listening on 5000'));
