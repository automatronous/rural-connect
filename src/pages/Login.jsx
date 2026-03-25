import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  // useState('') creates a state variable [a variable React watches for changes]
  // email stores what user types, setEmail updates it

  const [password, setPassword] = useState('');
  // same pattern for password field

  const [loading, setLoading] = useState(false);
  // loading = true shows "Signing in..." text on button, false shows "Sign In"

  const [error, setError] = useState(null);
  // stores error message string if login fails, null means no error

  const { signIn, refreshProfile } = useAuth();
  // pulls signIn function and refreshProfile from AuthContext
  // signIn = calls Supabase to authenticate
  // refreshProfile = updates the profile in React context

  const navigate = useNavigate();
  // navigate() = programmatically [via code, not clicking a link] change the page

  const handleLoginClick = async () => {

    // Guard clause [early exit if condition not met]
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);  // show "Signing in..." on button
    setError(null);    // clear any previous error message

    try {

      // Step 1: Authenticate with Supabase
      await signIn(email, password);
      // await = wait for this to finish before moving to next line
      // throws an error automatically if credentials are wrong

      // Step 2: Refresh profile in React context
      await refreshProfile();
      // updates the profile state in AuthContext
      // BUT we don't rely on it below because React state
      // updates are async [not instant] — race condition risk

      // Step 3: Fetch role directly from Supabase database
      const { data: { user } } = await supabase.auth.getUser();
      // getUser() returns the currently logged-in user object
      // we need user.id to query the profiles table

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')       // look in profiles table
        .select('role')         // only fetch the role column
        .eq('id', user.id)      // where id matches logged in user
        .single();              // expect exactly one row back

      // Step 4: Fallback if profile doesn't exist or fetch failed
      if (profileError || !profileData) {
        navigate('/');
        return;
      }

      // Step 5: Redirect based on role
      if (profileData.role === 'doctor') {
        navigate('/doctor/dashboard');
        // doctor goes to doctor dashboard
      } else if (profileData.role === 'patient') {
        navigate('/patient/dashboard');
        // patient goes to patient dashboard
      } else {
        navigate('/');
        // unknown role fallback, goes to landing page
      }

    } catch (err) {
      // catches wrong password, network error, etc.
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
      // finally block ALWAYS runs, success or fail
      // stops the loading spinner either way
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-primary-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary-200/50 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 sm:p-10 w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <HeartPulse className="w-12 h-12 text-primary-500 animate-pulse-slow" />
        </div>
        <h2 className="font-display text-gray-900 text-3xl font-bold mb-8 text-center tracking-tight">Welcome Back</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2 font-sans">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // onChange fires every keystroke, updates email state
              className="glass-input"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2 font-sans">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // same pattern, updates password state on every keystroke
              className="glass-input"
              placeholder="Enter your password"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLoginClick}
            // calls handleLoginClick when button is pressed
            disabled={loading}
            // disables button while login is in progress, prevents double clicks
            className="btn-primary mt-4 flex items-center justify-center"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {/* ternary [shorthand if-else]: if loading is true show "Signing in..." else "Sign In" */}
          </motion.button>

          {error && (
            // only renders the error block if error is not null
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center mt-4 text-sm font-medium"
            >
              {error}
            </motion.p>
          )}
        </div>

        <p className="text-gray-600 text-center mt-8 font-medium">
          New to RuralConnect? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
