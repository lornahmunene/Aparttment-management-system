import React, { useState } from "react";
import { useNavigate } from "react-router"; // Use react-router-dom for consistency

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const BASE_URL = "http://127.0.0.1:5555";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 🚀 FIX: Use 'accessToken' key for consistency with ManagerDashboard
        localStorage.setItem("accessToken", data.access_token); 

        // Store other user data if needed (e.g., for greeting)
        localStorage.setItem("user", JSON.stringify(data.user)); 

        const role = data.user.role;
        setMessage("Login successful!");

        setTimeout(() => {
          // You should ensure the 'role' key is correct based on your Flask model.
          // Assuming 'landlord' and 'manager' are the correct roles for navigation.
          if (role === "landlord") navigate("/landlord-dashboard");
          else if (role === "manager") navigate("/manager-dashboard");
          else navigate("/"); // Default fallback
        }, 1000);
      } else {
        // 401 response from Flask-JWT-Extended is handled here
        setMessage(data.message || "Login failed.");
      }
    } catch (err) {
      // Network or general error
      setMessage("Error connecting to server.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-r from-purple-400 via-purple-300 to-sky-300">
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-10 w-full max-w-md">
        <p className="text-center text-white text-4xl font-bold mb-6">Welcome Back</p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center text-sm ${message.includes('successful') ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p className="text-white text-lg mb-2">Email Address</p>
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 mb-5 rounded-full bg-white/70 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <p className="text-white text-lg mb-2">Password</p>
          <input
            type="password"
            name="password"
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 mb-5 rounded-full bg-white/70 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            className="w-full py-3 mt-3 rounded-full text-white text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-white">
          Forgot your password?{" "}
          <a href="/reset-password" className="text-blue-200 hover:underline">
            Reset it here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;