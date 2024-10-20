import React from 'react'
import { useState,useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "../Components/Avatar";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/userSlice";
import Loader from '../Components/Loader';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false)
  //console.log(location)
  //console.log(location?.state?.email)

  
  const [data, setData] = useState({
    email: "",
    verificationCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => {
      // Corrected here
      return {
        ...prev, // Spread 'prev' properly
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/verifyemail`;
    // const Url = "http://localhost:4000/api/v1/password"
    try {
        setLoading(true)
      const response = await axios.post(Url,{
        email:location?.state?.email,
        verificationCode:data.verificationCode
      })
      setLoading(false);
      // //console.log(response.data)
      toast.success(response?.data?.message);
      if (response.data.success) {
        dispatch(setToken(response?.data?.token))
        localStorage.setItem('token', response?.data?.token);
        setData({
          verificationCode: "",
        });
      }
      navigate("/");
    } catch (error) {
        setLoading(false);
      if (error.response && error.response.data) {
        // Handle the 400 error from backend
        //console.log("Error message:", error.response.data.message); // This should print "User Already Exists"
        toast.error(error?.response?.data?.message);
      } else {
        // Handle any other errors
        console.error("Error occurred:", error.message);
        toast.error(error.message);
      }
    }
  };


  useEffect(()=>{
    if(!location.state?.name){
      navigate('/email')
    }
  })



  return (
    <div className="mt-10 ">
        <div className="bg-white w-full max-w-sm mx:2  rounded overflow-hidden p-4 md:mx-auto">
          <div className="w-fit mx-auto mb-2 flex justify-center items-center flex-col">
            {/* <PiUserCircleLight size={80} /> */}
            <Avatar
              width={70}
              height={70}
              name={location?.state?.name}
              imageUrl={location?.state?.profile_pic}
            />
            <h2 className="font-semibold text-lg mt-1">{location?.state?.name}</h2>
          </div>
          <h3>Welcome to Whisper</h3>

          <form action="" className="grid gap-4 mt-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label htmlFor="verificationCode">OTP :</label>
              <input
                type="text"
                id="verificationCode"
                placeholder="Please Enter your OTP"
                name="verificationCode"
                className="bg-slate-100 px-2 py-1 focus:outline-primary"
                value={data.verificationCode}
                onChange={handleChange}
                required
              />
            </div>

            <button className="bg-primary text-lg px-4 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
              {loading?<Loader/>:"Verify"}
            </button>
          </form>
          <p className="my-3 text-center">
           
            <Link
              to={"/forgot-password"}
              className="hover:text-primary font-semibold  "
            >
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
  )
}

export default VerifyEmail