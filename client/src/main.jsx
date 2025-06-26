import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './All_Components/screen/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext'; // ✅ Import admin context
import axios from "axios";

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <AdminAuthProvider> {/* ✅ Wrap AdminAuthProvider here */}
          <App />
        </AdminAuthProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
);
