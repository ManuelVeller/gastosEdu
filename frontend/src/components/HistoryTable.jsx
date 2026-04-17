import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const response = await fetch('http://187.127.0.145:5678/webhook/contabilidad');
const data = await response.json();

function HistoryTable({ data, loading }) {
    if (loading) {
        return (
            <div className="animate-pulse bg-slate-200 h-64 rounded-3xl w-full"></div>
        );
    }

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
            'Fecha': item.date,
            'Total Diario': item.daily_total,
            'Total Semanal': item.weekly_total,
            'Total Mes': item.monthly_total
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');
        XLSX.writeFile(workbook, 'Historial_Gastos.xlsx');
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
            'Fecha': item.date,
            'Total Diario': item.daily_total,
            'Total Semanal': item.weekly_total,
            'Total Mes': item.monthly_total
        })));
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Historial_Gastos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Historial de Gastos", 14, 15);

        const tableColumn = ["Fecha", "Total Diario", "Total Semanal", "Total Mes"];
        const tableRows = [];

        data.forEach(item => {
            const rowData = [
                item.date,
                `$${item.daily_total.toFixed(2)}`,
                `$${item.weekly_total.toFixed(2)}`,
                `$${item.monthly_total.toFixed(2)}`
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('Historial_Gastos.pdf');
    };
    console.log(data); 
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-semibold text-slate-800">Historial</h3>
                <div className="flex gap-2">
                    <button onClick={handleExportCSV} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg font-medium transition-colors">CSV</button>
                    <button onClick={handleExportExcel} className="text-xs bg-green-50 hover:bg-green-100 text-green-700 py-1.5 px-3 rounded-lg font-medium transition-colors border border-green-200">Excel</button>
                    <button onClick={handleExportPDF} className="text-xs bg-red-50 hover:bg-red-100 text-red-700 py-1.5 px-3 rounded-lg font-medium transition-colors border border-red-200">PDF</button>
                </div>
            </div>

            {data?.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">No hay datos históricos</p>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="p-4 font-semibold">Fecha</th>
                                    <th className="p-4 font-semibold text-right">Diario</th>
                                    <th className="p-4 font-semibold text-right">Semanal</th>
                                    <th className="p-4 font-semibold text-right">Mes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {data.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 whitespace-nowrap font-medium text-slate-700">{row.date}</td>
                                        <td className="p-4 text-right font-semibold text-expense-600">${row.daily_total.toFixed(2)}</td>
                                        <td className="p-4 text-right font-semibold text-slate-700">${row.weekly_total.toFixed(2)}</td>
                                        <td className="p-4 text-right font-semibold text-slate-700">${row.monthly_total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HistoryTable;
