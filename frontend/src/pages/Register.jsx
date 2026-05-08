import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
export default function Register() {
  const {register}=useAuth()
  const navigate=useNavigate()
  const [form, setForm]=useState({ username:'', email:'',password: '' })
  const [loading, setLoading] = useState(false)
  const set=(k)=>(e)=>setForm(p=>({...p,[k]:e.target.value }))
  const handleSubmit = async (e) => {
    e.preventDefault()
    if(!form.username||!form.email||!form.password)
      return toast.error('All fields required')
    if(form.password.length < 6)
      return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try{
      await register(form.username,form.email,form.password)
      toast.success('Account created! Please log in.')
      navigate('/login')
    } 
    catch(err){
      toast.error(err.response?.data?.message||'Registration failed')
    } 
    finally{
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-up">
        <div className="auth-logo">Task<span>Flow</span></div>
        <div className="auth-tagline">Create your account</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input type="text" placeholder="Name" value={form.username} onChange={set('username')} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="min 6 characters" value={form.password} onChange={set('password')} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}} /> Creating…</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}