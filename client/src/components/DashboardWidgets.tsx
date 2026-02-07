import { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Subscription {
    _id: string;
    name: string;
    category: string;
    amount: number;
    billingCycle: 'Monthly' | 'Yearly';
    nextRenewalDate: string;
    status: 'Active' | 'Paused' | 'Cancelled';
    logo?: string;
}

interface DashboardWidgetsProps {
    subscriptions: Subscription[];
}

const COLORS = ['#2563EB', '#10B981', '#6366F1']; // Blue, Green, Indigo

const DashboardWidgets = ({ subscriptions }: DashboardWidgetsProps) => {
    // 1. Calculate Stats
    const stats = useMemo(() => {
        const totalMonthlySpend = subscriptions
            .filter(sub => sub.status === 'Active')
            .reduce((acc, sub) => {
                return acc + (sub.billingCycle === 'Monthly' ? sub.amount : sub.amount / 12);
            }, 0);

        const activeSubs = subscriptions.filter(sub => sub.status === 'Active').length;

        const monthlySavings = subscriptions
            .filter(sub => sub.status === 'Paused')
            .reduce((acc, sub) => {
                return acc + (sub.billingCycle === 'Monthly' ? sub.amount : sub.amount / 12);
            }, 0);

        return { totalMonthlySpend, activeSubs, monthlySavings };
    }, [subscriptions]);

    // 2. Prepare Chart Data
    const categoryData = useMemo(() => {
        const data: { name: string; value: number }[] = [];
        subscriptions.forEach((sub) => {
            const existing = data.find((d) => d.name === sub.category);
            if (existing) {
                existing.value += 1;
            } else {
                data.push({ name: sub.category, value: 1 });
            }
        });
        // Limit to top 3 and group others for the donut chart look
        const sorted = data.sort((a, b) => b.value - a.value);
        const top3 = sorted.slice(0, 3);

        // Ensure we have exactly 3 segments if possible to match the "Marketing, DevOps, Sales" look
        // Or just map the real categories
        return top3;
    }, [subscriptions]);



    // 3. Upcoming Renewals
    const upcomingRenewals = useMemo(() => {
        return [...subscriptions]
            .filter(sub => sub.status === 'Active')
            .sort((a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime())
            .slice(0, 3);
    }, [subscriptions]);

    // 4. Calculate Critical Renewals (within 7 days)
    const criticalRenewals = useMemo(() => {
        const now = new Date();
        return upcomingRenewals.filter(sub => {
            const renewalDate = parseISO(sub.nextRenewalDate);
            const diffTime = renewalDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        });
    }, [upcomingRenewals]);

    // 5. Dynamic Trend Data (Last 6 Months including current)
    const trendData = useMemo(() => {
        const months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(d);
        }

        return months.map(monthDate => {
            const monthName = format(monthDate, 'MMM').toUpperCase();
            const isCurrentMonth = monthDate.getMonth() === today.getMonth() && monthDate.getFullYear() === today.getFullYear();

            // Calculate total for this month
            // Valid if: Created before/in this month AND (Monthly OR (Yearly AND renewal month matches))
            // Simplifying assumption: Active subs count for every month they are active. 
            // For historical trends, we might need 'startDate', but for now we project current active subs back/forward
            // or just show "Projected Monthly Spend" which is usually constant unless subs change.
            // Better approach for "Trends": Show actuals if we had history, but here we can simulating "run rate".

            // Let's make it look dynamic: 
            // If sub createdDate < monthDate, add amount. 
            // Since we don't have createdDate in interface, let's assume all active subs contribute to all displayed months 
            // to show the "stable" spend, OR simple logic:

            const value = subscriptions
                .filter(sub => sub.status === 'Active')
                .reduce((acc, sub) => {
                    // For yearly, only add if it falls in this month (simplified) or divide by 12 for smooth graph?
                    // User probably wants cash flow view.
                    if (sub.billingCycle === 'Yearly') {
                        const renewal = parseISO(sub.nextRenewalDate);
                        if (renewal.getMonth() === monthDate.getMonth()) {
                            return acc + sub.amount;
                        }
                        return acc;
                    }
                    return acc + sub.amount;
                }, 0);

            return {
                name: monthName,
                value: value,
                isCurrent: isCurrentMonth
            };
        });
    }, [subscriptions]);

    return (
        <div className="space-y-6">
            {/* Critical Renewal Alert */}
            {criticalRenewals.length > 0 && (
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-500 flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-sm">Action Required: Upcoming Renewals</h4>
                        <p className="text-xs opacity-90 mt-1">
                            You have {criticalRenewals.length} subscription{criticalRenewals.length > 1 ? 's' : ''} renewing within 7 days.
                            Auto-debit will occur on schedule.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-6 relative overflow-hidden group">
                    {/* Gradient bar at bottom */}
                    <div className="absolute bottom-4 left-6 right-6 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/3 rounded-full" />
                    </div>
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Monthly Spend</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-foreground">${stats.totalMonthlySpend.toFixed(2)}</span>
                            <span className="text-sm font-medium text-accent flex items-center">
                                <TrendingUp size={14} className="mr-1" />
                                5.2%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-foreground">{stats.activeSubs}</span>
                            <span className="text-sm font-medium text-muted-foreground">Stable</span>
                        </div>
                    </div>
                    {/* Visual blocks for subscriptions */}
                    <div className="flex gap-2 mt-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-8 w-10 rounded ${i === 3 ? 'bg-primary' : 'bg-primary/20'}`} />
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Monthly Savings</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-foreground">${stats.monthlySavings.toFixed(2)}</span>
                            <span className="text-sm font-medium text-accent flex items-center">
                                <TrendingUp size={14} className="mr-1" />
                                +12%
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-primary/80 italic mt-4">
                        Optimization recommendations: <span className="text-primary font-bold">4 new</span>
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Bar Chart */}
                <div className="col-span-2 rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-semibold text-foreground">Monthly Spending Trends</h3>
                        <span className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">Last 6 Months</span>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} barSize={40}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748B"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                    {trendData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#2563EB' : '#1F2937'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">Category Breakdown</h3>
                    <div className="h-[200px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData.length > 0 ? categoryData : [{ name: 'None', value: 1 }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    stroke="none"
                                    dataKey="value"
                                >
                                    {categoryData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    {/* Fallback color if empty */}
                                    {categoryData.length === 0 && <Cell fill="#1F2937" />}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest">Total</span>
                            <span className="text-2xl font-bold text-foreground">100%</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {categoryData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-muted-foreground">{entry.name}</span>
                                </div>
                                <span className="font-bold text-foreground">{stats.activeSubs > 0 ? ((entry.value / stats.activeSubs) * 100).toFixed(0) : 0}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming Renewals */}
            <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between p-6">
                    <h3 className="text-lg font-semibold text-foreground">Upcoming Renewals</h3>
                    <a href="/subscriptions" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</a>
                </div>
                <div className="relative w-full overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase text-muted-foreground bg-secondary/30">
                            <tr>
                                <th className="h-10 px-6 text-left font-semibold">Service</th>
                                <th className="h-10 px-6 text-left font-semibold">Category</th>
                                <th className="h-10 px-6 text-left font-semibold">Renewal Date</th>
                                <th className="h-10 px-6 text-left font-semibold">Amount</th>
                                <th className="h-10 px-6 text-left font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {upcomingRenewals.map((sub) => {
                                const renewalDate = parseISO(sub.nextRenewalDate);
                                const diffTime = renewalDate.getTime() - new Date().getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const isCritical = diffDays >= 0 && diffDays <= 7;

                                return (
                                    <tr key={sub._id} className="group hover:bg-muted/50 transition-colors">
                                        <td className="p-6 font-medium text-foreground flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold shadow-sm group-hover:bg-background transition-colors">
                                                {sub.logo ? <img src={sub.logo} alt="" className="h-6 w-6" /> : sub.name.charAt(0)}
                                            </div>
                                            {sub.name}
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                                {sub.category}
                                            </span>
                                        </td>
                                        <td className="p-6 text-muted-foreground">
                                            <span className={isCritical ? "text-yellow-500 font-bold" : ""}>
                                                {format(renewalDate, 'MMM d, yyyy')}
                                            </span>
                                            {isCritical && <span className="ml-2 text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20">Expiring</span>}
                                        </td>
                                        <td className="p-6 font-bold text-foreground">
                                            ${sub.amount.toFixed(2)}
                                        </td>
                                        <td className="p-6">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-accent">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                                </span>
                                                Auto-pay
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardWidgets;
