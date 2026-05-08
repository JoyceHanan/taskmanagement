import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  withCredentials: true,         // sends cookies (JWT) automatically
  headers: { 'Content-Type': 'application/json' },
})

export default api