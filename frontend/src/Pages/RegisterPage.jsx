import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../Helper/uploadFile";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import Loader from "../Components/Loader";

const RegisterPage = () => {
    const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: "",
  });
  const [uploadPhoto, setUploadPhoto] = useState(null);

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

  const handleUploadPhoto = async(e) => {
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file)
    setUploadPhoto(file);

    setData((prev)=>{
        return{
            ...prev,
            profile_pic:uploadPhoto?.url
        }
    })
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();

    setUploadPhoto(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
  
    const emailDomain = data.email.split('@')[1]; // Get everything after the '@'
  
    const restrictedDomains = ['viit.ac.in', 'vupune.ac.in', 'vit.edu'];
  
    if (restrictedDomains.includes(emailDomain)) {
      toast.error('Registrations from this domain are not allowed.');
      return; 
    }
  
    const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/register`;
    try {
      setLoading(true);
  
      const response = await axios.post(Url, data);
      setLoading(false);
  
      toast.success(response?.data?.message);
      if (response.data.success) {
        setData({
          name: '',
          email: '',
          password: '',
          profile_pic: '',
        });
      }
  
      navigate('/verifyemail', {
        state: response?.data?.data,
      });
    } catch (error) {
      setLoading(false);
  
      if (error.response && error.response.data) {
        toast.error(error?.response?.data?.message);
      } else {
        console.error('Error occurred:', error.message);
        toast.error(error.message);
      }
    }
  };
  
  return (
    <>
      <div className="mt-10 flex items-center justify-center">
        <div className="bg-white w-full max-w-sm mx:2  rounded overflow-hidden p-4 md:mx-auto">
          <h3>Welcome to Whisper</h3>

          <form action="" className="grid gap-4 mt-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label htmlFor="name">Name :</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Please Enter your name"
                className="bg-slate-100 px-2 py-1 focus:outline-primary"
                value={data.name}
                onChange={handleChange}
                required
              />
            </div>
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
            <div className="flex flex-col gap-1">
              <label htmlFor="password">Password :</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Please Enter your password"
                className="bg-slate-100 px-2 py-1 focus:outline-primary"
                value={data.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="profile_pic">
                Photo :
                <div className="h-14 bg-slate-200 flex cursor-pointer justify-center items-center border hover:border-primary rounded">
                  <p className="text-sm max-w-[300px] text-ellipsis line-clamp-1">
                    {uploadPhoto?.name
                      ? uploadPhoto.name
                      : "Upload Profile Photo"}
                  </p>
                  {uploadPhoto?.name && (
                    <button
                      className="text-lg ml-2 hover:text-red-600"
                      onClick={handleClearUploadPhoto}
                      type="button" // Prevent form submission when clearing the photo
                    >
                      <IoIosClose />
                    </button>
                  )}
                </div>
              </label>

              <input
                type="file"
                id="profile_pic"
                name="profile_pic"
                className="bg-slate-100 px-2 py-1 focus:outline-primary hidden"
                onChange={handleUploadPhoto}
              />
            </div>

            <button className="bg-primary text-lg px-4 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
              {loading?<Loader/>:"Register"}
            </button>
          </form>
          <p className="my-3 text-center">Already have account? <Link to={"/email"} className="hover:text-primary font-semibold  ">Login</Link></p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
