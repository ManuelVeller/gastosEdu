import React from 'react';

function Dashboard({ data, loading }) {
    if (loading) {
        return <div className="animate-pulse bg-slate-200 h-32 rounded-3xl w-full"></div>;
    }

    const { today_total, week_total, month_total, last_expenses } = data;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-expense-50 p-5 rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center border border-expense-100">
                    <span className="text-expense-600/80 text-sm font-semibold tracking-wide uppercase">Hoy</span>
                    <span className="text-3xl font-black text-expense-900 mt-1">${today_total?.toFixed(2) || '0.00'}</span>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="bg-slate-50 p-4 pl-5 rounded-2xl border border-slate-100 flex flex-col justify-center flex-1">
                        <span className="text-slate-500 text-xs font-semibold tracking-wide uppercase">Esta Semana</span>
                        <span className="text-lg font-bold text-slate-800">${week_total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="bg-slate-50 p-4 pl-5 rounded-2xl border border-slate-100 flex flex-col justify-center flex-1">
                        <span className="text-slate-500 text-xs font-semibold tracking-wide uppercase">Este Mes</span>
                        <span className="text-lg font-bold text-slate-800">${month_total?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 px-1">Gastos Recientes</h3>
                {last_expenses?.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">Sin gastos recientes</p>
                ) : (
                    <div className="space-y-3">
                        {last_expenses.map((expense, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-expense-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-expense-100 text-expense-600 flex items-center justify-center text-sm font-bold shadow-sm">
                                        {expense.category.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 leading-tight">{expense.category}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[120px]">{expense.description || 'No notes'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-expense-600">${expense.amount.toFixed(2)}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
