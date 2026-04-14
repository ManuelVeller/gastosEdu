require('dotenv').config({ path: '../config/.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
//const { createClient } = require('@supabase/supabase-js');

/*const supabase = createClient(
  'https://lonwiccfgyjhxslusuny.supabase.co',
  'sb_publishable_YXU4rrTWudw0A0h-MUdD2Q_XKli7jhK'
);*/
const app = express();
const PORT = process.env.PORT || 3001;
const N8N_WEBHOOK_URL = 'http://187.127.0.145:5678/webhook/expense';
const N8N_CONTABILIDAD_URL = 'http://187.127.0.145:5678/webhook/contabilidad';

app.use(cors());
app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "sheets-gastosedu@gastosedun8n.iam.gserviceaccount.com",
    private_key: "faa6b33450286f08150bcde600ad840a90d6cc08"
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
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
      timestamp: timestamp || new Date().toISOString()
    };

    // guardar en memoria para dashboard
    expenses.push(newExpense);

    // enviar a n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    res.status(200).json({
      success: true,
      message: 'Expense sent to n8n successfully'
    });

  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to save expense'
    });
  }
});


app.get('/api/summary', async (req, res) => {
  try {
    const response = await fetch('http://187.127.0.145:5678/webhook/contabilidad');
    const data = await response.json();

    res.status(200).json({
      today_total: data["Total Diario"],
      week_total: data["Total Semanal"],
      month_total: data["Total Mes"]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary from n8n' });
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

app.get('/', (req, res) => {
  res.send('Backend funcionando OK');
});


/*app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); */

//prueba123