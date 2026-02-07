import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Banknote, FileBarChart, Settings, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
    onAddSubscription: () => void;
}

const Sidebar = ({ onAddSubscription }: SidebarProps) => {
    const { pathname } = useLocation();
    const { logout } = useAuth();

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
        { name: 'Payments', path: '/payments', icon: Banknote },
        { name: 'Reports', path: '/reports', icon: FileBarChart },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card text-card-foreground">
            <div className="flex h-20 items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                        <img src="/logo.svg" alt="Spendora" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold font-heading">Spendora</h1>
                        <p className="text-xs text-muted-foreground">Enterprise Analytics</p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-2">
                <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Menu</p>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all group',
                                    isActive
                                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                )}
                            >
                                <Icon size={18} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 space-y-4">
                <button
                    onClick={onAddSubscription}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} />
                    Add Subscription
                </button>

                <div className="border-t border-border pt-4">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
