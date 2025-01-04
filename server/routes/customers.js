const express = require('express');
const router = express.Router();
const { Customer } = require('../database');

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Customer.update(parseInt(req.params.id), req.body);
        if (updated) {
            const customer = await Customer.findOne(parseInt(req.params.id));
            res.json(customer);
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const success = await Customer.destroy(parseInt(req.params.id));
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;