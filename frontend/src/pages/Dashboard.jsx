import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

// ── Edit Modal ──────────────────────────────────────────────
function EditModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title:task.title,
    status:task.status||'pending',
    priority:task.priority||'medium',
  })
  const [loading, setLoading] = useState(false)
  const set=(k)=>(e)=>setForm(p=>({ ...p,[k]:e.target.value }))
  const submit = async(e)=>{
    e.preventDefault()
    if (!form.title.trim()) 
        return toast.error('Title required')
    setLoading(true)
    try{
      await api.put(`/task-api/tasks/${task._id}`, form)
      toast.success('Task updated')
      onSave()
    } 
    catch(err){
      toast.error(err.response?.data?.message||'Update failed')
    } 
    finally{ 
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Edit Task</div>
        <form onSubmit={submit}>
          <div className="field">
            <label>Title</label>
            <input type="text" value={form.title} onChange={set('title')} />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Task Item ───────────────────────────────────────────────
function TaskItem({ task, onEdit, onDelete }) {
  const status = task.status || 'pending'
  return (
    <div className="task-item">
      <div className={`status-dot ${status.replace(' ', '-')}`} />
      <div className={`task-title ${status === 'completed' ? 'done' : ''}`}>
        {task.title}
      </div>
      <span className={`priority-tag ${task.priority || 'medium'}`}>
        {task.priority || 'medium'}
      </span>
      <span className="task-date">
        {new Date(task.createdAt).toLocaleDateString()}
      </span>
      <div className="task-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(task._id)}>Del</button>
      </div>
    </div>
  )
}
// ── Dashboard ───────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout }=useAuth()
  const navigate=useNavigate()
  const [tasks,setTasks]=useState([])
  const [users,setUsers]=useState([])
  const [editing,setEditing]=useState(null)
  const [taskLoad,setTaskLoad]=useState(true)
  const [userLoad,setUserLoad]=useState(false)
  const [newTask, setNewTask]=useState({ title: '', priority: 'medium' })
  const [adding, setAdding]=useState(false)

  const isAdmin=user?.role ==='ADMIN'

  // ── Load tasks ──
  const loadTasks = useCallback(async () => {
    setTaskLoad(true)
    try {
      const res=await api.get('/task-api/tasks')
      setTasks(res.data.payload||[])
    } 
    catch(err){
      toast.error('Failed to load tasks')
    } 
    finally{
        setTaskLoad(false) 
    }
  },[])

  // ── Load users (admin only) ──
  const loadUsers=useCallback(async()=>{
    setUserLoad(true)
    try{
      const res=await api.get('/admin-api/admin/users')
      setUsers(res.data.payload||[])
    } 
    catch(err){
      toast.error(err.response?.data?.message||'Failed to load users')
    } 
    finally{
        setUserLoad(false) 
    }
  }, [])
  useEffect(()=>{ loadTasks() },[loadTasks])
  useEffect(()=>{ if(isAdmin)loadUsers() },[isAdmin, loadUsers])

  // ── Create task ──
  const createTask = async(e)=>{
    e.preventDefault()
    if (!newTask.title.trim()) 
        return toast.error('Title is required')
    setAdding(true)
    try{
      await api.post('/task-api/tasks',{ ...newTask,status:'pending' })
      toast.success('Task created!')
      setNewTask({ title:'', priority:'medium' })
      loadTasks()
    } 
    catch(err){
      toast.error(err.response?.data?.message||'Create failed')
    } finally{
        setAdding(false)
    }
  }

  // ── Delete task ──
  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) 
        return
    try {
      await api.delete(`/task-api/tasks/${id}`)
      toast.success('Task deleted')
      loadTasks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  // ── Logout ──
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dash-wrap fade-up">

      {/* Header */}
      <header className="dash-header">
        <div>
          <div className="dash-name">
            {user?.username || user?.email?.split('@')[0]}
            <span className={`badge ${isAdmin ? 'ADMIN' : ''}`}>
              {user?.role || 'user'}
            </span>
          </div>
          <div className="dash-email">{user?.email}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
      </header>

      {/* New Task */}
      <div className="section-label">New Task</div>
      <div className="card">
        <form className="task-form" onSubmit={createTask}>
          <div className="field">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="field">
            <select
              value={newTask.priority}
              onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={adding}>
            {adding ? 'Adding…' : '+ Add Task'}
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="section-label">My Tasks ({tasks.length})</div>
      {taskLoad ? (
        <div className="empty-state"><span className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks yet. Add your first one above.</div>
      ) : (
        tasks.map(t => (
          <TaskItem
            key={t._id}
            task={t}
            onEdit={setEditing}
            onDelete={deleteTask}
          />
        ))
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <div className="admin-panel">
          <div className="admin-label">⬡ Admin — All Users ({users.length})</div>
          {userLoad ? (
            <div className="empty-state"><span className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state">No users found.</div>
          ) : (
            users.map(u => (
              <div className="user-row" key={u._id}>
                <div className="u-name">{u.username || '—'}</div>
                <div className="u-email">{u.email}</div>
                <span className={`badge ${u.role === 'ADMIN' ? 'ADMIN' : ''}`}>
                  {u.role || 'user'}
                </span>
              </div>
            ))
          )}
          <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={loadUsers}>
            Refresh
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <EditModal
          task={editing}
          onClose={() => setEditing(null)}
          onSave={() => { setEditing(null); loadTasks() }}
        />
      )}
    </div>
  )
}