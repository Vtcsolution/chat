import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Properly fetch user using HTTP-only cookie
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/users/me`, {
        withCredentials: true, // ✅ This sends the HTTP-only cookie
      })
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        setUser(null);
      });
  }, []);

  // ✅ Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // ✅ important to receive cookie
        }
      );

      const registeredUser = response.data.user;
      setUser(registeredUser);
      return { success: true, user: registeredUser };
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong during registration";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

 
const login = async (credentials) => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/users/login`,
      credentials,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // ✅ ensures cookie is sent and received
      }
    );

    const loggedInUser = response.data.user; // not response.data.token
    setUser(loggedInUser); // store user info in context/state
    return { success: true, user: loggedInUser };
  } catch (err) {
    const message = err.response?.data?.message || "Login failed";
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};


  // ✅ Logout function
  const logout = () => {
    setUser(null);
    setError(null);
    // You could also call a logout route on the server here if needed
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
