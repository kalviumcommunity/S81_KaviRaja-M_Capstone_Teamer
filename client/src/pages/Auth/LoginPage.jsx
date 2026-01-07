import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getBackendURL } from '../../utils/fetchApi';

const Login = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            // Login success handled by auth context/effect
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-void relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="glass-card w-full max-w-md p-8 relative z-10 mx-4 border-neon-blue/10 animate-fade-in">
                <h2 className="heading-lg text-3xl text-center mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-center mb-8">Sign in to continue to Teamer</p>

                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-sm text-gray-400 ml-1 mb-1 block">Email or Username</label>
                        <input
                            name="email"
                            type="text"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 ml-1 mb-1 block">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                        <div className="text-right mt-1">
                            <span className="text-xs text-neon-blue cursor-pointer hover:text-white transition-colors">Forgot Password?</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary mt-4"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-white/10"></div>
                    <span className="px-3 text-gray-500 text-sm">or continue with</span>
                    <div className="flex-1 border-t border-white/10"></div>
                </div>

                <button
                    onClick={() => window.location.href = getBackendURL() + '/auth/google'}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 px-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-medium"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Google
                </button>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <span
                        onClick={() => navigate("/signup")}
                        className="text-white font-semibold cursor-pointer hover:text-neon-blue transition-colors"
                    >
                        Sign Up
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
