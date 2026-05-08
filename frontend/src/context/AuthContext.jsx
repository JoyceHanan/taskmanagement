import { createContext,useContext,useState,useEffect } from 'react'
import api from '../api/axios'
const AuthContext = createContext(null)
export function AuthProvider({children}) {
  const [user,setUser]=useState(null)
  const [loading,setLoading]=useState(true)
  // On mount: check if a valid session cookie exists
  useEffect(() => {
    api.get('/user-api/check-auth')
      .then(res => setUser(res.data.payload))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  },[])
  const login = async (email,password) => {
    const res = await api.post('/user-api/login', { email, password })
    setUser(res.data.payload)
    return res.data
  }
  const register=async(username,email,password) => {
    const res=await api.post('/user-api/register', { username, email, password })
    return res.data
  }
  const logout=async()=>{
    await api.get('/user-api/logout')
    setUser(null)
  }
  return (
    <AuthContext.Provider value={{user,loading,login,register,logout}}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth=()=>useContext(AuthContext)