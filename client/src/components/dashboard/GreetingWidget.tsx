import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const GreetingWidget = () => {
    const { user } = useAuth();
    const date = new Date();
    const hour = date.getHours();

    let greeting = '';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
        >
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white mb-2">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-muted-foreground text-lg">
                Let's crush your financial goals today.
            </p>
        </motion.div>
    );
};

export default GreetingWidget;
