import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from '../Components/Loader';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/reset-password/${token}`;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(Url, {
        newPassword: passwordData.newPassword,
      });
      setLoading(false);
      toast.success(response?.data?.message);
      navigate("/login"); // Redirect to login after successful reset
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data) {
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error occurred:", error.message);
        toast.error("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password'); // Redirect if no token is present
    }
  }, [token, navigate]);

  return (
    <div className="mt-10">
      <div className="bg-white w-full max-w-sm mx-auto rounded overflow-hidden p-4">
        <h2 className="text-center text-xl font-semibold mb-4">Reset Your Password</h2>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter your new password"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={passwordData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your new password"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button className="bg-primary text-lg px-4 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
            {loading ? <Loader /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
