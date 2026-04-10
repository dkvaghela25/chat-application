import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { loginUser } from '../api/auth';

const RegistrationPage = () => {

    const navigate = useNavigate();

    const initialData = {
        "email": "",
        "password": "",
    }

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);

    const validateForm = () => {
        const tempErrors = { ...initialData };
        setErrors(initialData);

        const { email, password } = formData;

        if (!email) tempErrors.email = "Email Id is required field"
        if (!password) tempErrors.password = "Password is required field"

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

        const res = await loginUser(formData)

        if (res.success) {
            navigate("/")
        }

    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">

                <div className="pt-10 pb-6 px-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Login</h1>
                </div>

                <form className="px-8 pb-10 space-y-5" onSubmit={handleSubmit}>

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


                    <div className="pt-2">
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                            Login
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;