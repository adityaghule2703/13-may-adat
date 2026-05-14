// src/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, Eye, EyeOff, AlertCircle, TrendingUp, 
  ArrowRight, CheckCircle, Shield, Leaf, 
  Users, DollarSign, Package, Truck, Zap,
  Award, Star, Mail, Phone, Calendar
} from 'lucide-react';
import BASE_URL from '../config/Config';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login to:', `${BASE_URL}/auth/login`);
      console.log('With credentials:', { email: formData.email, password: '***' });
      
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        // Store tokens and user data
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          console.log('Token saved:', data.accessToken.substring(0, 50) + '...');
        } else {
          console.error('No accessToken in response');
        }
        
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Verify token was saved
        const savedToken = localStorage.getItem('token');
        console.log('Token verification - saved successfully:', !!savedToken);
        console.log('Redirecting to dashboard...');
        
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error details:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'superadmin@farmerp.com',
      password: 'password123'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#E8F5E9' }}>
      {/* Main Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Side - Brand Panel */}
          <div className="relative overflow-hidden p-8 lg:p-12" style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)' }}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF6F00]/20 rounded-full blur-3xl"></div>
            
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 right-20 animate-float">
              <Leaf className="w-8 h-8 text-white/20" />
            </div>
            <div className="absolute bottom-32 left-20 animate-float-delay">
              <TrendingUp className="w-10 h-10 text-white/20" />
            </div>

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">AgriBroker</h1>
                  <p className="text-xs text-white/70">Finance & Trading System</p>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur mb-4">
                  <Award className="w-3 h-3 text-[#FF8F00]" />
                  <span className="text-xs text-white">Trusted Platform</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                  Smart Trading,<br />
                  <span className="text-[#FF8F00]">Better Growth</span>
                </h2>
                <p className="text-base leading-relaxed text-white/80">
                  Streamline your agricultural business with our comprehensive 
                  trading and financial management platform.
                </p>
              </div>

              {/* Stats Grid */}
              {/* <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[#FF8F00]" />
                    <span className="text-xs text-white/70">Total Volume</span>
                  </div>
                  <p className="text-2xl font-bold text-white">₹50L+</p>
                  <p className="text-xs text-green-300 mt-1">↑ 32% this month</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#FF8F00]" />
                    <span className="text-xs text-white/70">Active Farmers</span>
                  </div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs text-green-300 mt-1">↑ 18% new</p>
                </div>
              </div> */}

             
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 lg:p-12 bg-white">
            <div className="max-w-md mx-auto">
             

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1B5E20' }}>Welcome Back</h3>
                <p className="text-sm" style={{ color: '#8D6E63' }}>Enter your credentials to continue</p>
              </div>

             

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8F5E9]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white" style={{ color: '#8D6E63' }}>Secure Login</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#C8E6C9]" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="superadmin@farmerp.com"
                      className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-all bg-white"
                      style={{ color: '#1B5E20' }}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-all bg-white pr-12"
                      style={{ color: '#1B5E20' }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

               

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

             

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t border-[#E8F5E9]">
                <p className="text-xs" style={{ color: '#8D6E63' }}>© 2026 AgriBroker. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;