const express = require('express');
const router = express.Router();
const { Product } = require('../database');

router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Product.update(parseInt(req.params.id), req.body);
        if (updated) {
            const product = await Product.findOne(parseInt(req.params.id));
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const success = await Product.destroy(parseInt(req.params.id));
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;