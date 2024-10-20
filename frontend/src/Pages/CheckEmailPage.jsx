import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { PiUserCircleLight } from "react-icons/pi";
const CheckEmailPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: ""
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


  const handleSubmit = async(e) => {
    e.preventDefault();
    e.stopPropagation();

    const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/email`;
    try {
        const response = await axios.post(Url,data)
        toast.success(response.data.message)
        if(response.data.success){
            setData({
                email: "",
            })
        }
        navigate("/password",{
          state:response?.data?.data
        })
    } catch (error) {
        if (error.response && error.response.data) {
            // Handle the 400 error from backend
            //console.log('Error message:', error.response.data.message);  // This should print "User Already Exists"
            toast.error(error?.response?.data?.message)
          } else {
            // Handle any other errors
            console.error('Error occurred:', error.message);
            toast.error(error.message)

          }
    }
  };
  return (
    <>
    
      <div className="mt-10 ">
        <div className="bg-white w-full max-w-sm mx:2  rounded overflow-hidden p-4 md:mx-auto  ">
        <div className="w-fit mx-auto mb-2">
        <PiUserCircleLight size={80} />
        </div>
          <h3>Welcome to Whisper</h3>

          <form action="" className="grid gap-4 mt-5" onSubmit={handleSubmit}>
          
            <div className="flex flex-col gap-1">
              <label htmlFor="email">Email :</label>
              <input
                type="email"
                id="email"
                placeholder="Please Enter your email"
                name="email"
                className="bg-slate-100 px-2 py-1 focus:outline-primary"
                value={data.email}
                onChange={handleChange}
                required
              />
            </div>
        
            

            <button className="bg-primary text-lg px-4 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
              Enter
            </button>
          </form>
          <p className="my-3 text-center">New User? <Link to={"/register"} className="hover:text-primary font-semibold  ">Register</Link></p>
        </div>
      </div>
    </>
  )
}

export default CheckEmailPage