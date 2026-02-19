import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, Shield, Bell, Zap, Moon, DollarSign, Lock, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user, logout, setUser } = useAuth(); // Assuming setUser is available in context, if not need to add it or refetch
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // Preferences State (Persisted to LocalStorage)
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('spendora_prefs');
        return saved ? JSON.parse(saved) : { push: true, monthlyReport: true };
    });

    useEffect(() => {
        localStorage.setItem('spendora_prefs', JSON.stringify(notifications));
    }, [notifications]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/users/profile', profileData);

            // Update local state and storage so user doesn't need to log in again
            if (user) {
                const updatedUser = { ...user, ...data };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update persisted user
            }

            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
        setIsEditing(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            await api.put('/users/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setShowPasswordForm(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you SURE you want to delete your account? This action is irreversible.')) {
            try {
                await api.delete('/users/profile');
                toast.success('Account deleted.');
                logout();
                navigate('/login');
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete account');
            }
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold font-heading text-white">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Profile & Account */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <div className="p-6 rounded-2xl bg-card border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <User size={20} className="text-primary" />
                                Profile Information
                            </h2>
                            <button
                                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                className="text-sm font-medium text-primary hover:text-primary/80"
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Full Name</p>
                                        <p className="font-medium text-white">{user?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email Address</p>
                                        <p className="font-medium text-white">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preferences */}
                    <div className="p-6 rounded-2xl bg-card border border-white/5">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                            <Zap size={20} className="text-yellow-400" />
                            App Preferences
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/10 text-white"><Moon size={18} /></div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Appearance</p>
                                        <p className="text-xs text-muted-foreground">Dark mode is enabled by default</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-white/10 text-white px-3 py-1 rounded-full">Locked</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><DollarSign size={18} /></div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Primary Currency</p>
                                        <p className="text-xs text-muted-foreground">Display all amounts in Rupees (₹)</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-green-400">INR (₹)</span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="p-6 rounded-2xl bg-card border border-white/5">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                            <Bell size={20} className="text-red-400" />
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Push Notifications', desc: 'Receive real-time alerts', state: 'push' },
                                { label: 'Smart Insights', desc: 'Get AI-powered recommendations', state: 'monthlyReport' }
                            ].map((item: any) => (
                                <div key={item.state} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.label}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications({ ...notifications, [item.state]: !notifications[item.state as keyof typeof notifications] })}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${notifications[item.state as keyof typeof notifications] ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${notifications[item.state as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Danger Zone */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-card border border-white/5">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                            <Shield size={20} className="text-blue-400" />
                            Security
                        </h2>

                        {!showPasswordForm ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Lock size={16} /> Change Password
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Save</button>
                                    <button type="button" onClick={() => setShowPasswordForm(false)} className="flex-1 py-2 bg-white/5 text-white rounded-lg text-sm font-medium">Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20">
                        <h2 className="text-lg font-semibold text-destructive mb-2 flex items-center gap-2">
                            <Trash2 size={18} /> Danger Zone
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">Irreversible actions for your account.</p>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium mb-3"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full text-sm text-destructive hover:underline"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
