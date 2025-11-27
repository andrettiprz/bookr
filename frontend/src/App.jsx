import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReservationsProvider } from './context/ReservationsContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Header from './components/Header'
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
        <ReservationsProvider>
          <BrowserRouter>
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/reservations" element={<Reservations />} />
                  <Route path="/reservations/new" element={<ReservationForm />} />
                  <Route path="/reservations/:id" element={<ReservationDetail />} />
                  <Route path="/reservations/:id/edit" element={<ReservationForm />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/" element={<Navigate to="/reservations" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </ReservationsProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
