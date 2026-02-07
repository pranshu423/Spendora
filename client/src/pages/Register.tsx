import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const schema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const Register = () => {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            setError('');
            const response = await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
            });
            login(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background font-body selection:bg-primary selection:text-white">
            {/* Liquid Background Blobs - Different arrangement for variety */}
            <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px] animate-pulse delay-700" />

            <div className="w-full max-w-md relative z-10 p-6">
                <div className="mb-8 text-center">
                    <h1 className="text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 font-heading drop-shadow-sm">
                        Spendora
                    </h1>
                </div>

                <div className="backdrop-blur-xl bg-card/40 border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-white">Create an account</h2>
                        <p className="mt-2 text-sm text-gray-400">Get started with Spendora</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider">Full Name</label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:bg-white/10"
                                    placeholder="Enter your full name"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider">Email</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:bg-white/10"
                                    placeholder="name@company.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider">Password</label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:bg-white/10"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider">Confirm Password</label>
                                <input
                                    {...register('confirmPassword')}
                                    type="password"
                                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:bg-white/10"
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-blue-400 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
