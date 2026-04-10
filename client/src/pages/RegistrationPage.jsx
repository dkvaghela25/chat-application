import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    }

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const validateForm = () => {
        const tempErrors = { ...initialData };
        setErrors(initialData);

        const { name, username, email, password, confirmPassword } = formData;

        if (!name) tempErrors.name = "Name is required field"
        if (!username) tempErrors.username = "Username is required field"

        if (!email) {
            tempErrors.email = "Email Id is required field"
        } else if (!emailRegex.test(email)) {
            tempErrors.email = "Invalid Email Id"
        }

        if (!password) {
            tempErrors.password = "Password is required field"
        } else if (!strongPasswordRegex.test(password)) {
            tempErrors.password = "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character"
        }

        if (!confirmPassword) {
            tempErrors.confirmPassword = "Confirm Password is required field"
        } else if (confirmPassword !== password) {
            tempErrors.confirmPassword = "Confirm Password does not match password"
        }

        setErrors(tempErrors);

        return Object.values(tempErrors).every(x => x === "");

    }


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) return;

        // eslint-disable-next-line no-unused-vars
        const { confirmPassword, ...requestData } = formData;

        console.log(requestData);

        const res = await registerUser(requestData)

        if(res.success) {
            navigate("/login")
        }

    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">

                <div className="pt-10 pb-6 px-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Create New User</h1>
                </div>

                <form className="px-8 pb-10 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Name
                        </label>
                        <input
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter Your Name"
                            className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                        />
                        {errors.name && <p className='text-sm text-red-500'> * {errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Username
                        </label>
                        <input
                            name='username'
                            value={formData.username}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter Your Name"
                            className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                        />
                        {errors.username && <p className='text-sm text-red-500'> * {errors.username}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Email Id
                        </label>
                        <input
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter Your Name"
                            className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                        />
                        {errors.email && <p className='text-sm text-red-500'> * {errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Password
                        </label>
                        <div className='relative'>
                            <input
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Your Name"
                                className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-(--secondary-text) hover:text-primary-text transition-colors duration-200"
                            >
                                {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className='text-sm text-red-500'> * {errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Confirm Password
                        </label>
                        <div className='relative'>
                            <input
                                name='confirmPassword'
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Enter Your Name"
                                className="w-full px-5 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-(--secondary-text) hover:text-primary-text transition-colors duration-200"
                            >
                                {showConfirmPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className='text-sm text-red-500'> * {errors.confirmPassword}</p>}
                    </div>

                    <div className="pt-2">
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                            Register
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;