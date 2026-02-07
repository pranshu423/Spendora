import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user } = useAuth();
    // Assuming user might be null initially
    const firstName = user?.name?.split(' ')[0] || 'User';

    return (
        <header className="flex h-20 items-center justify-between border-b border-border bg-background px-8">
            <div>
                {/* Search bar removed as requested */}
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold leading-none">{user?.name || 'Guest'}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-sm font-bold text-white shadow-lg shadow-primary/20 ring-2 ring-background">
                        {firstName.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
