import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ReservationsProvider } from './context/ReservationsContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Reservations from './pages/Reservations'
import ReservationForm from './pages/ReservationForm'
import ReservationDetail from './pages/ReservationDetail'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import './styles.css'

function App() {
  return (
    <AuthProvider>
      <ReservationsProvider>
        <BrowserRouter>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reservations" 
                  element={
                    <ProtectedRoute>
                      <Reservations />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reservations/new" 
                  element={
                    <ProtectedRoute>
                      <ReservationForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reservations/:id" 
                  element={
                    <ProtectedRoute>
                      <ReservationDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reservations/:id/edit" 
                  element={
                    <ProtectedRoute>
                      <ReservationForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/calendar" 
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ReservationsProvider>
    </AuthProvider>
  )
}

export default App
