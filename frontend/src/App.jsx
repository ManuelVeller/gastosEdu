import React, { useState, useEffect } from 'react';
import ExpenseForm from './components/ExpenseForm';
import Dashboard from './components/Dashboard';
import HistoryTable from './components/HistoryTable';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [summaryData, setSummaryData] = useState({
    today_total: 0,
    week_total: 0,
    month_total: 0,
    last_expenses: []
  });
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend API URL (for demo sake, hardcoded or env)
  const API_BASE = 'http://localhost:3001/api';

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [summaryRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/summary`),
        fetch(`${API_BASE}/history`)
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummaryData(data);
      }
      if (historyRes.ok) {
        const hData = await historyRes.json();
        setHistoryData(hData.history);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshTrigger]);

  const handleExpenseSaved = () => {
    // Refresh the dashboard data
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[90vh] max-h-[850px] relative">
        <header className="bg-expense-600 text-white p-6 pb-8 text-center rounded-b-[2rem] shadow-md z-10 relative">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Mis Gastos</h1>
          <p className="text-expense-100/80 text-sm font-medium"></p>
        </header>

        <div className="flex-1 overflow-y-auto z-0 -mt-6 pt-10 px-6 pb-6 space-y-8 no-scrollbar relative">
          <section>
            <ExpenseForm onSaved={handleExpenseSaved} apiBase={API_BASE} />
          </section>

          <hr className="border-slate-100" />

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-expense-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-expense-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Historial
            </button>
          </div>

          <section>
            {activeTab === 'dashboard' ? (
              <Dashboard data={summaryData} loading={loading} />
            ) : (
              <HistoryTable data={historyData} loading={loading} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
