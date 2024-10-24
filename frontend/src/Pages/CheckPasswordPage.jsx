import { useState,useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "../Components/Avatar";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/userSlice";
import Loader from "../Components/Loader";
const CheckPasswordPage = () => {

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // //console.log(location);
  const [data, setData] = useState({
    userId: "",
    password: "",
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
  const navigateToForgotPassword=async(e)=>{
    e.preventDefault();
    e.stopPropagation();
    setLoading(true)
    const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/forgot-password`;
    try {
      const response = await axios.post(Url,{
        email:location?.state?.email,
      })
      toast.success(response?.data?.message);
      setLoading(false);
    } catch (error) {
      setLoading(false)
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
    
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/password`;
    // const Url = "http://localhost:4000/api/v1/password"
    try {
      const response = await axios.post(Url,{
        userId:location?.state?._id,
        password:data.password
      })
      // //console.log(response.data)
      toast.success(response?.data?.message);
      if (response.data.success) {
        dispatch(setToken(response?.data?.token))
        localStorage.setItem('token', response?.data?.token);
        setData({
          password: "",
        });
      }
      navigate("/");
    } catch (error) {
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
    <>
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
          <h3>Welcome to ChatWave</h3>

          <form action="" className="grid gap-4 mt-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label htmlFor="email">Password :</label>
              <input
                type="password"
                id="password"
                placeholder="Please Enter your password"
                name="password"
                className="bg-slate-100 px-2 py-1 focus:outline-primary"
                value={data.password}
                onChange={handleChange}
                required
              />
            </div>

            {!loading&&<button className="bg-primary text-lg px-4 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
              Verify
            </button>}
          </form>
          <p className="my-3 text-center">
           
            {loading?<Loader/>:(<button
              onClick={navigateToForgotPassword}
              className="hover:text-primary font-semibold  "
            >
              Forgot Password?
            </button>)}
          </p>
        </div>
      </div>
    </>
  );
};

export default CheckPasswordPage;
