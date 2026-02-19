import { useEffect, useState, useMemo } from 'react';
import api from '../lib/axios';
import { Loader2, PieChart as PieChartIcon, BarChart as BarChartIcon, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Subscription {
    _id: string;
    name: string;
    category: string;
    amount: number;
    billingCycle: string;
    nextRenewalDate: string;
    status: string;
    logo?: string;
}

const COLORS = ['#2563EB', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

const Reports = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/subscriptions');
                setSubscriptions(data);
            } catch (error) {
                console.error('Failed to fetch report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const handleUpdate = () => fetchData();
        window.addEventListener('subscription_updated', handleUpdate);
        window.addEventListener('subscription_added', handleUpdate);
        window.addEventListener('subscription_deleted', handleUpdate);

        return () => {
            window.removeEventListener('subscription_updated', handleUpdate);
            window.removeEventListener('subscription_added', handleUpdate);
            window.removeEventListener('subscription_deleted', handleUpdate);
        };
    }, []);

    const categoryData = useMemo(() => {
        const data: Record<string, number> = {};
        subscriptions.filter(s => s.status === 'Active').forEach(sub => {
            const amount = sub.billingCycle === 'Monthly' ? sub.amount : sub.amount / 12;
            data[sub.category] = (data[sub.category] || 0) + amount;
        });
        return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [subscriptions]);

    const monthlySpendData = useMemo(() => {
        // Simplified projection: Showing estimated spend for next 6 months based on current active subs
        const data = [];
        const today = new Date();
        for (let i = 0; i < 6; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const monthName = format(date, 'MMM yyyy');

            // Calculate spend for this specific month
            let total = 0;
            subscriptions.filter(s => s.status === 'Active').forEach(sub => {
                if (sub.billingCycle === 'Monthly') {
                    total += sub.amount;
                } else if (sub.billingCycle === 'Yearly') {
                    const renewalMonth = parseISO(sub.nextRenewalDate).getMonth();
                    if (renewalMonth === date.getMonth()) {
                        total += sub.amount;
                    }
                }
            });
            data.push({ name: monthName, total });
        }
        return data;
    }, [subscriptions]);

    const handleExport = () => {
        const headers = ['Name,Category,Amount,Billing Cycle,Next Renewal,Status,Yearly Cost'];
        const rows = subscriptions.map(sub => {
            const yearlyCost = sub.billingCycle === 'Monthly' ? sub.amount * 12 : sub.amount;
            return [
                sub.name,
                sub.category,
                sub.amount,
                sub.billingCycle,
                format(parseISO(sub.nextRenewalDate), 'yyyy-MM-dd'),
                sub.status,
                yearlyCost
            ].join(',');
        });

        const csvContent = headers.concat(rows).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `spendora_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-white">Financial Reports</h1>
                    <p className="text-muted-foreground mt-1">Deep dive into your spending habits.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="p-6 rounded-2xl bg-card border border-white/5 h-[400px] flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon size={20} className="text-blue-400" />
                        <h3 className="font-semibold text-white">Spend by Category</h3>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `₹${value.toFixed(2)}`}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Projection */}
                <div className="p-6 rounded-2xl bg-card border border-white/5 h-[400px] flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChartIcon size={20} className="text-green-400" />
                        <h3 className="font-semibold text-white">6-Month Projection</h3>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlySpendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    formatter={(value: number) => `₹${value.toFixed(2)}`}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="rounded-2xl bg-card border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-semibold text-white">Subscription Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase text-muted-foreground bg-white/5">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Cost</th>
                                <th className="px-6 py-4 font-medium">Billing</th>
                                <th className="px-6 py-4 font-medium">Yearly Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {subscriptions.map(sub => {
                                const yearlyCost = sub.billingCycle === 'Monthly' ? sub.amount * 12 : sub.amount;
                                return (
                                    <tr key={sub._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{sub.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{sub.category}</td>
                                        <td className="px-6 py-4 text-white">₹{sub.amount}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{sub.billingCycle}</td>
                                        <td className="px-6 py-4 font-bold text-white">₹{yearlyCost.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
