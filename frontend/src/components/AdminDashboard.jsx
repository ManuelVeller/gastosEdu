import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LogOut, Users, FileText, CheckCircle, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = ({ user, onLogout }) => {
  const [gastos, setGastos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen'); // resumen, gastos, tareas

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [gastosRes, tareasRes] = await Promise.all([
        supabase.from('gastos').select('*, perfiles(nombre)').order('fecha_gasto', { ascending: false }),
        supabase.from('tareas').select('*, perfiles!empleado_id(nombre)').order('creado_at', { ascending: false })
      ]);

      if (gastosRes.error) throw gastosRes.error;
      if (tareasRes.error) throw tareasRes.error;

      setGastos(gastosRes.data || []);
      setTareas(tareasRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Preparar datos para gráficos
  const gastosPorCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + parseFloat(g.monto);
    return acc;
  }, {});
  
  const chartData = Object.keys(gastosPorCategoria).map(key => ({
    name: key,
    total: gastosPorCategoria[key]
  }));

  const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <header className="bg-expense-600 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm opacity-80">Gestión de Gastos y Tareas</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-lg transition-colors">
          <span className="hidden sm:inline text-sm">Cerrar Sesión</span>
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <nav className="sm:w-64 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          <button onClick={() => setActiveTab('resumen')} className={`flex items-center gap-3 p-3 rounded-xl whitespace-nowrap transition-colors ${activeTab === 'resumen' ? 'bg-expense-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            <PieChart className="w-5 h-5" /> Resumen
          </button>
          <button onClick={() => setActiveTab('gastos')} className={`flex items-center gap-3 p-3 rounded-xl whitespace-nowrap transition-colors ${activeTab === 'gastos' ? 'bg-expense-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            <FileText className="w-5 h-5" /> Todos los Gastos
          </button>
          <button onClick={() => setActiveTab('tareas')} className={`flex items-center gap-3 p-3 rounded-xl whitespace-nowrap transition-colors ${activeTab === 'tareas' ? 'bg-expense-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            <CheckCircle className="w-5 h-5" /> Tareas
          </button>
        </nav>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 min-h-[500px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400">Cargando datos...</div>
          ) : (
            <>
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800">Resumen General</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium">Gastos Totales</p>
                      <p className="text-3xl font-black text-expense-600">${totalGastos.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium">Total Registros</p>
                      <p className="text-3xl font-black text-slate-700">{gastos.length}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium">Tareas Pendientes</p>
                      <p className="text-3xl font-black text-amber-500">{tareas.filter(t => t.estado === 'pendiente').length}</p>
                    </div>
                  </div>

                  <div className="h-[300px] mt-8 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'gastos' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-800">Todos los Gastos</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-100 text-slate-500">
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Empleado</th>
                          <th className="p-3">Categoría</th>
                          <th className="p-3">Descripción</th>
                          <th className="p-3">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gastos.map(g => (
                          <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-3 text-sm text-slate-600">{new Date(g.fecha_gasto).toLocaleDateString()}</td>
                            <td className="p-3 text-sm font-medium text-slate-800">{g.perfiles?.nombre || 'Desconocido'}</td>
                            <td className="p-3 text-sm text-slate-600">{g.categoria}</td>
                            <td className="p-3 text-sm text-slate-500">{g.descripcion}</td>
                            <td className="p-3 font-bold text-expense-600">${g.monto}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'tareas' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Tareas de Empleados</h2>
                    {/* Botón para asignar nueva tarea (placeholder para futura impl) */}
                    <button className="bg-expense-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-expense-700">Nueva Tarea</button>
                  </div>
                  <div className="space-y-3">
                    {tareas.length === 0 ? (
                      <p className="text-slate-400">No hay tareas creadas.</p>
                    ) : (
                      tareas.map(t => (
                        <div key={t.id} className="border border-slate-100 p-4 rounded-xl flex justify-between items-center bg-slate-50">
                          <div>
                            <h4 className="font-bold text-slate-700">{t.titulo}</h4>
                            <p className="text-sm text-slate-500">Asignada a: {t.perfiles?.nombre}</p>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {t.estado}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
