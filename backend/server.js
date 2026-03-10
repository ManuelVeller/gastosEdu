require('dotenv').config({ path: '../config/.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const N8N_WEBHOOK_URL = 'https://manutest26.app.n8n.cloud/webhook/gasto';

app.use(cors());
app.use(bodyParser.json());

// Mock database for standard demonstration
let expenses = [];

app.post('/api/expense', async (req, res) => {
  try {
    const { amount, category, description, date, timestamp } = req.body;

    const newExpense = {
      amount: Number(amount),
      category,
      description: description || '',
      date,
      timestamp
    };

    // Save locally for dashboard
    expenses.push(newExpense);

    // In a real scenario, this would send an HTTP POST to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    });

    console.log(`[n8n Webhook Mock] Sent expense to ${N8N_WEBHOOK_URL}`, newExpense);

    res.status(200).json({ success: true, message: 'Expense saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save expense' });
  }
});

app.get('/api/summary', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Calculate totals
    const todayTotal = expenses
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);

    // Simple mock for week/month totals (would normally use robust date math)
    const weekTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Last 5
    const lastExpenses = [...expenses].reverse().slice(0, 5);

    res.status(200).json({
      today_total: todayTotal,
      week_total: weekTotal,
      month_total: monthTotal,
      last_expenses: lastExpenses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

app.get('/api/history', (req, res) => {
  try {
    const getWeekKey = (dateStr) => {
      const d = new Date(dateStr + 'T12:00:00Z');
      const day = d.getUTCDay();
      const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d.setUTCDate(diff));
      return start.toISOString().split('T')[0];
    };

    const getMonthKey = (dateStr) => {
      return dateStr.substring(0, 7);
    };

    const uniqueDates = [...new Set(expenses.map(e => e.date))].sort((a, b) => new Date(b) - new Date(a));

    const history = uniqueDates.map(date => {
      const dailyTotal = expenses.filter(e => e.date === date).reduce((sum, e) => sum + e.amount, 0);

      const weekKey = getWeekKey(date);
      const weeklyTotal = expenses.filter(e => getWeekKey(e.date) === weekKey).reduce((sum, e) => sum + e.amount, 0);

      const monthKey = getMonthKey(date);
      const monthlyTotal = expenses.filter(e => getMonthKey(e.date) === monthKey).reduce((sum, e) => sum + e.amount, 0);

      return {
        date,
        daily_total: dailyTotal,
        weekly_total: weeklyTotal,
        monthly_total: monthlyTotal
      };
    });

    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
