import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut } from 'lucide-react';

const Settings = () => {
    const { user, logout } = useAuth();

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold font-heading text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account preferences</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <User size={20} /> Profile
                    </h2>
                    <div className="grid gap-4 max-w-md">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <input
                                type="text"
                                value={user?.name || ''}
                                disabled
                                className="mt-1 block w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="mt-1 block w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Bell size={20} /> Notifications
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground">Email Alerts</p>
                                <p className="text-sm text-muted-foreground">Receive updates about your subscription renewals</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>



                {/* Danger Zone */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                        <LogOut size={20} /> Danger Zone
                    </h2>
                    <button
                        onClick={logout}
                        className="rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
