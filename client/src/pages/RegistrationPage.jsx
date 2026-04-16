import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { registerUser } from '../api/auth';

const RegistrationPage = () => {
    const navigate = useNavigate();
    const initialData = {
        "name": "",
        "username": "",
        "email": "",
        "password": "",
        "confirmPassword": "",
    };

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const validateForm = () => {
        const tempErrors = { ...initialData };
        const { name, username, email, password, confirmPassword } = formData;

        if (!name) tempErrors.name = "Full Name is required";
        if (!username) tempErrors.username = "Username is required";

        if (!email) {
            tempErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            tempErrors.email = "Invalid Email Address";
        }

        if (!password) {
            tempErrors.password = "Password is required";
        } else if (!strongPasswordRegex.test(password)) {
            tempErrors.password = "Must be 8+ chars with Uppercase, Number & Symbol";
        }

        if (!confirmPassword) {
            tempErrors.confirmPassword = "Please confirm your password";
        } else if (confirmPassword !== password) {
            tempErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === "");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (!validateForm()) return;
            
            setLoading(true)

            // eslint-disable-next-line no-unused-vars
            const { confirmPassword, ...requestData } = formData;
            const res = await registerUser(requestData);

            if (res.success) {
                navigate("/login");
            }
        }
        catch (error) {
            setLoading(false)
            console.error("Registration Failed : ", error)
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                <div className="pt-10 pb-6 px-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
                    <p className="text-slate-500 mt-2">Join us today to get started</p>
                </div>

                <form className="px-8 pb-10 grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Full Name <span className='text-red-500'>*</span></label>
                        <input
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            type="text"
                            placeholder="John Doe"
                            className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                        />
                        {errors.name && <p className='text-xs text-red-500 mt-1 ml-1 font-medium'>{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Username <span className='text-red-500'>*</span></label>
                        <input
                            name='username'
                            value={formData.username}
                            onChange={handleChange}
                            type="text"
                            placeholder="johndoe123"
                            className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                        />
                        {errors.username && <p className='text-xs text-red-500 mt-1 ml-1 font-medium'>{errors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address <span className='text-red-500'>*</span></label>
                        <input
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="john@example.com"
                            className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                        />
                        {errors.email && <p className='text-xs text-red-500 mt-1 ml-1 font-medium'>{errors.email}</p>}
                    </div>

                    <div className='relative'>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Password <span className='text-red-500'>*</span></label>
                        <div className="relative">
                            <input
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className='text-xs text-red-500 mt-1 ml-1 font-medium leading-tight'>{errors.password}</p>}
                    </div>

                    <div className='relative'>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Confirm Password <span className='text-red-500'>*</span></label>
                        <div className="relative">
                            <input
                                name='confirmPassword'
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className='text-xs text-red-500 mt-1 ml-1 font-medium'>{errors.confirmPassword}</p>}
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <button className={`w-full text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-2 ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                            {loading ? "Registering ..." : "Register"}
                        </button>
                        <div className="text-center mt-6">
                            <p className="text-slate-600 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;