import { Card } from 'react-bootstrap';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const monthlyOrdersData = [
  { month: 'Jan', orders: 18 },
  { month: 'Feb', orders: 24 },
  { month: 'Mar', orders: 21 },
  { month: 'Apr', orders: 28 },
  { month: 'May', orders: 34 },
  { month: 'Jun', orders: 39 },
  { month: 'Jul', orders: 31 },
  { month: 'Aug', orders: 44 },
  { month: 'Sep', orders: 49 },
  { month: 'Oct', orders: 53 },
  { month: 'Nov', orders: 57 },
  { month: 'Dec', orders: 62 },
];

function MonthlyOrdersChart() {
  return (
    <Card className="admin-table-card admin-chart-card">
      <Card.Header className="admin-table-header">
        <h2>Monthly Orders</h2>
      </Card.Header>
      <Card.Body className="admin-chart-body">
        <ResponsiveContainer width="100%" height={310}>
          <LineChart data={monthlyOrdersData} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 6" stroke="rgba(34, 197, 94, 0.22)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#065f46', fontSize: 12, fontWeight: 600 }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#065f46', fontSize: 12 }} />
            <Tooltip
              cursor={{ stroke: 'rgba(22, 163, 74, 0.35)', strokeWidth: 1 }}
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 12px 30px rgba(2, 44, 20, 0.16)',
              }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ r: 4, stroke: '#16a34a', strokeWidth: 2, fill: '#dcfce7' }}
              activeDot={{ r: 6, stroke: '#059669', fill: '#ecfdf5' }}
              isAnimationActive
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}

export default MonthlyOrdersChart;
