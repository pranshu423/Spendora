import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../lib/axios';
import { Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AnalyticsData {
    totalMonthlySpend: number;
    categoryBreakdown: { _id: string; total: number; count: number }[];
    statusCounts: { _id: string; count: number }[];
}

const Analytics = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const { data } = await api.get('/analytics');
            setData(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!data) return <div>No data available</div>;

    const categoryData = data.categoryBreakdown.map(item => ({
        name: item._id,
        value: item.total
    }));

    const statusData = data.statusCounts.map(item => ({
        name: item._id,
        count: item.count
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Monthly Spend</h3>
                    <p className="mt-2 text-3xl font-bold text-primary">${data.totalMonthlySpend.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                        {data.statusCounts.find(s => s._id === 'Active')?.count || 0}
                    </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Top Category</h3>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                        {data.categoryBreakdown.sort((a, b) => b.total - a.total)[0]?._id || 'N/A'}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">Spend by Category</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">Subscription Status</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#82ca9d" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
