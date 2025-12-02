import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ReservationsProvider } from './context/ReservationsContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Reservations from './pages/Reservations'
import ReservationForm from './pages/ReservationForm'
import ReservationDetail from './pages/ReservationDetail'
import Calendar from './pages/Calendar'
import './styles.css'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ReservationsProvider>
            <BrowserRouter>
              <div className="app">
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Rutas protegidas */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <>
                        <Header />
                        <main className="main-content">
                          <Dashboard />
                        </main>
                      </>
                    </ProtectedRoute>
                  } />
                  <Route path="/reservations" element={
                    <ProtectedRoute>
                      <>
                        <Header />
                        <main className="main-content">
                          <Reservations />
                        </main>
                      </>
                    </ProtectedRoute>
                  } />
                  <Route path="/reservations/new" element={
                    <ProtectedRoute>
                      <>
                        <Header />
                        <main className="main-content">
                          <ReservationForm />
                        </main>
                      </>
                    </ProtectedRoute>
                  } />
                  <Route path="/reservations/:id" element={
                    <ProtectedRoute>
                      <>
                        <Header />
                        <main className="main-content">
                          <ReservationDetail />
                        </main>
                      </>
                    </ProtectedRoute>
                  } />
                  <Route path="/reservations/:id/edit" element={
                    <ProtectedRoute>
                      <>
                        <Header />
                        <main className="main-content">
                          <ReservationForm />
                        </main>
                      </>
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <>
                        <Header />
                        <main className="main-content">
                          <Calendar />
                        </main>
                      </>
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </div>
            </BrowserRouter>
          </ReservationsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
