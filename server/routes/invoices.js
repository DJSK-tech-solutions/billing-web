const express = require('express');
const router = express.Router();
const { Invoice } = require('../database');

router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.findAll();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const invoice = await Invoice.create(req.body);
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analytics endpoint
router.get('/analytics', async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Get all invoices
        const invoices = await Invoice.findAll();

        // Calculate date ranges
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const startOfCurrentYear = new Date(currentYear, 0, 1);
        const startOfLastYear = new Date(currentYear - 1, 0, 1);

        // Calculate revenues
        const currentMonthRevenue = invoices
            .filter(inv => new Date(inv.date) >= startOfCurrentMonth)
            .reduce((sum, inv) => sum + inv.total, 0);

        const lastMonthRevenue = invoices
            .filter(inv => {
                const date = new Date(inv.date);
                return date >= startOfLastMonth && date < startOfCurrentMonth;
            })
            .reduce((sum, inv) => sum + inv.total, 0);

        const currentYearRevenue = invoices
            .filter(inv => new Date(inv.date) >= startOfCurrentYear)
            .reduce((sum, inv) => sum + inv.total, 0);

        const lastYearRevenue = invoices
            .filter(inv => {
                const date = new Date(inv.date);
                return date >= startOfLastYear && date < startOfCurrentYear;
            })
            .reduce((sum, inv) => sum + inv.total, 0);

        // Monthly revenue data
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
            const month = new Date(currentYear, currentMonth - i, 1);
            const monthRevenue = invoices
                .filter(inv => {
                    const invDate = new Date(inv.date);
                    return invDate.getMonth() === month.getMonth() &&
                           invDate.getFullYear() === month.getFullYear();
                })
                .reduce((sum, inv) => sum + inv.total, 0);

            return {
                month: month.toLocaleString('default', { month: 'short' }),
                revenue: monthRevenue
            };
        }).reverse();

        res.json({
            currentMonthRevenue,
            lastMonthRevenue,
            currentYearRevenue,
            lastYearRevenue,
            monthlyRevenue
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;