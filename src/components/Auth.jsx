
import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState('')

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                setMessage('Check your email for the login link (or confirmation)!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
            }
        } catch (error) {
            setMessage(error.error_description || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-wood-dark font-pixel p-4">
            <div className="bg-wood border-4 border-wood-light shadow-pixel p-8 w-full max-w-md text-wood-dark">
                <h1 className="text-3xl uppercase text-center mb-6 tracking-widest text-shadow-sm">
                    {isSignUp ? 'New Harvester' : 'Welcome Back'}
                </h1>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs uppercase font-bold mb-1">Email</label>
                        <input
                            className="w-full bg-white border-2 border-wood-dark p-2 font-mono focus:outline-none focus:bg-yellow-50"
                            type="email"
                            placeholder="farmer@valley.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold mb-1">Password</label>
                        <input
                            className="w-full bg-white border-2 border-wood-dark p-2 font-mono focus:outline-none focus:bg-yellow-50"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="mt-4 bg-wood-dark text-wood-light py-3 uppercase tracking-widest hover:bg-wood-dark/90 transition-transform active:translate-y-1 shadow-pixel-sm disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 p-3 bg-white border-2 border-wood-dark text-xs font-mono text-center">
                        {message}
                    </div>
                )}

                <div className="mt-6 text-center text-sm">
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
                        className="underline hover:text-wood-light transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    )
}
