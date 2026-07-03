import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { UsersIcon, ShoppingBagIcon, CubeIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, revenue: 0 });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get('http://localhost:8000/api/admin/users/', { headers }),
      axios.get('http://localhost:8000/api/admin/orders/', { headers }),
      axios.get('http://localhost:8000/api/admin/products/', { headers }),
    ]).then(([users, orders, products]) => {
      const revenue = orders.data.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      setStats({
        users: users.data.length,
        orders: orders.data.length,
        products: products.data.length,
        revenue,
      });
    }).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Users',    value: stats.users,                        icon: UsersIcon,          color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders',   value: stats.orders,                       icon: ShoppingBagIcon,    color: 'bg-green-50 text-green-600' },
    { label: 'Total Products', value: stats.products,                     icon: CubeIcon,           color: 'bg-purple-50 text-purple-600' },
    { label: 'Revenue',        value: `₹${stats.revenue.toLocaleString()}`, icon: CurrencyRupeeIcon, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;