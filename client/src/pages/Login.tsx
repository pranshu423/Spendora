import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import api from '../lib/axios';

const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            setError('');
            const response = await api.post('/auth/login', data);
            login(response.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden font-body selection:bg-primary selection:text-white">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10 p-6"
            >
                <div className="mb-8 text-center">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 font-heading drop-shadow-sm"
                    >
                        Spendora
                    </motion.h1>
                </div>

                <div className="backdrop-blur-xl bg-card/40 border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 relative overflow-hidden group">
                    {/* Glass shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
                        <p className="mt-2 text-sm text-gray-400">Enter your credentials to access your account</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider">Email</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:bg-white/10"
                                    placeholder="name@company.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                            </motion.div>

                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider">Password</label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:bg-white/10"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
                            </motion.div>
                        </div>



                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </motion.button>
                    </form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center text-sm text-gray-400"
                    >
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-primary hover:text-blue-400 transition-colors">
                            Create an account
                        </Link>
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
