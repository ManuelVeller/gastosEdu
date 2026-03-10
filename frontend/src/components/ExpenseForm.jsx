import React, { useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Supplies', 'Other'];

function ExpenseForm({ onSaved, apiBase }) {
    const [formData, setFormData] = useState({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount) return;

        setLoading(true);
        setStatusText('Saving...');

        try {
            const response = await fetch(`${apiBase}/expense`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                setStatusText('Saved!');
                // Reset form, keep date and category but clear amounts
                setFormData(prev => ({ ...prev, amount: '', description: '' }));
                if (onSaved) onSaved();
            } else {
                setStatusText('Error saving');
            }
        } catch (err) {
            setStatusText('Network error');
        } finally {
            setTimeout(() => setStatusText(''), 3000);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex flex-col space-y-5 bg-gradient-to-b from-white to-slate-50/50">

                {/* Amount */}
                <div className="relative">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Amount</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-5 text-2xl font-black text-slate-300">$</span>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-3xl font-black text-slate-800 outline-none focus:border-expense-500 focus:ring-4 focus:ring-expense-500/10 transition-all placeholder:text-slate-200"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-expense-500 focus:ring-4 focus:ring-expense-500/10 transition-all"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Category</label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 outline-none appearance-none focus:border-expense-500 focus:ring-4 focus:ring-expense-500/10 transition-all cursor-pointer"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Description (Optional)</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What was this for?"
                        className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 outline-none focus:border-expense-500 focus:ring-4 focus:ring-expense-500/10 transition-all placeholder:text-slate-300"
                    />
                </div>

            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-expense-600 hover:bg-expense-700 active:scale-[0.98] text-white rounded-2xl font-bold text-lg shadow-lg shadow-expense-500/30 transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
                {statusText || 'Save Expense'}
            </button>
        </form>
    );
}

export default ExpenseForm;
