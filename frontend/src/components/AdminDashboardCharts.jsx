import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboardCharts({ stats }) {
  const monthlyData = useMemo(() => {
    const labels = stats?.monthly_labels || stats?.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const revenue_monthly = stats?.revenue_monthly || stats?.revenues_monthly || [];

    return revenue_monthly.map((v, idx) => ({
      month: labels[idx] || `M${idx + 1}`,
      revenue: Number(v) || 0,
    }));
  }, [stats]);

  const pieData = useMemo(() => {
    const top = stats?.top_services || stats?.services_top || [];
    return top.slice(0, 5).map((s, i) => ({
      name: s?.nom?.substring(0, 18) || `Service ${i + 1}`,
      value: Number(s?.revenue ?? s?.prix ?? 0) || 0,
      fill: COLORS[i % COLORS.length],
    }));
  }, [stats]);

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1.5px solid #e0f2fe',
            boxShadow: '0 4px 20px rgba(2,132,199,.07)',
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 800, color: '#0c2340', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-graph-up" style={{ color: '#0284c7' }} />
            Évolution revenus (6 mois)
          </div>
          <div style={{ padding: '8px 0' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toLocaleString()} FCFA`, 'Revenus']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e0f2fe' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} dot={{ fill: '#0284c7', r: 4 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1.5px solid #e0f2fe',
            boxShadow: '0 4px 20px rgba(2,132,199,.07)',
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 800, color: '#0c2340', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-pie-chart-fill" style={{ color: '#f59e0b' }} />
            Top services
          </div>
          <div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} FCFA`]} contentStyle={{ borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                <i className="bi bi-pie-chart" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }} />
                Aucune donnée
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          div{ }
        }
        @media(max-width:768px){
          .adminChartsGrid{ grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

