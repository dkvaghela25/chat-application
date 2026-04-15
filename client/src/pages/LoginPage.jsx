import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { loginUser } from '../api/auth';
import { useSocketContext } from '../contexts/socketContext';

const LoginPage = () => {
    const { socket } = useSocketContext();
    const navigate = useNavigate();
    const initialData = { "email": "", "password": "" };

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);

    const validateForm = () => {
        const tempErrors = { email: "", password: "" };
        const { email, password } = formData;
        let isValid = true;

        if (!email) {
            tempErrors.email = "Email Id is required";
            isValid = false;
        }
        if (!password) {
            tempErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const res = await loginUser(formData);
        if (res.success) {
            localStorage.setItem("username", res.username);

            if (!socket.connected) {
                socket.connect();
            }

            socket.on("connect", () => {
                socket.emit("join", res.username);
            });

            if (socket.connected) {
                socket.emit("join", res.username);
            }

            navigate("/");
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                <div className="pt-10 pb-6 px-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-800">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Please enter your details to login</p>
                </div>

                <form className="px-8 pb-8 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address <span className='text-red-500'>*</span></label>
                        <input
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="name@company.com"
                            className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                        />
                        {errors.email && <p className='text-xs text-red-500 mt-1 ml-1 font-medium'>{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Password <span className='text-red-500'>*</span></label>
                        <div className='relative'>
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
                        {errors.password && <p className='text-xs text-red-500 mt-1 ml-1 font-medium'>{errors.password}</p>}
                    </div>

                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-2">
                        Login
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-slate-600 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;