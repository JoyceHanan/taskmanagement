import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
export default function Login() {
  const { login }= useAuth()
  const navigate= useNavigate()
  const [form,setForm]=useState({ email: '', password: '' })
  const [loading, setLoading]=useState(false)
  const set=(k)=>(e)=>setForm(p=>({ ...p,[k]:e.target.value }))
  const handleSubmit=async(e)=>{
    e.preventDefault()
    if (!form.email||!form.password) 
        return toast.error('All fields required')
    setLoading(true)
    try {
      await login(form.email,form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } 
    catch(err){
      toast.error(err.response?.data?.message||'Login failed')
    } 
    finally{
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-up">
        <div className="auth-logo">Task<span>Flow</span></div>
        <div className="auth-tagline">Sign in to your account</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          No account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  )
}