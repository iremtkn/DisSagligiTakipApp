import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import DentalHealth from './pages/DentalHealth';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/profile" element={<Profile />} />

        <Route path="/dental-health" element={<DentalHealth />} />

      </Routes>
    </Router>
  );
}

export default App;