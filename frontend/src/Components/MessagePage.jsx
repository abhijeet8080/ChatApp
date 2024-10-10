import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { GoPlus } from "react-icons/go";
import { FaImage } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { IoChevronBackOutline } from "react-icons/io5";
import uploadFile from "../Helper/uploadFile";
import { IoIosClose } from "react-icons/io";
import Loader from "./Loader"
const MessagePage = () => {
  const params = useParams();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false)
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });

  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
  });
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  console.log("userId ", params.userId);
  const handleImageVideoUpload = () => {
    setOpenImageVideoUpload((prev) => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);

    setMessage((prev) => {
      return {
        ...prev,
        imageUrl: uploadPhoto?.url,
      };
    });
  };

  const handleClearPhoto = async(e)=>{
    setMessage((prev) => {
      return {
        ...prev,
        imageUrl: "",
      };
    });
  }
  const handleClearVideo = async(e)=>{
    setMessage((prev) => {
      return {
        ...prev,
        videoUrl: "",
      };
    });
  }
  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    
    const uploadVideo = await uploadFile(file);

    setLoading(false);

    setMessage((prev) => ({
      ...prev,
      videoUrl: uploadVideo?.url, // Changed from imageUrl to videoUrl
    }));
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params.userId);
      socketConnection.on("message-user", (data) => {
        console.log("user details", data);
        setDataUser(data);
      });
    }
  }, [socketConnection, params?.userId, user]);

  return (
    <>
      <header className="sticky top-0 h-16 bg-white  flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="flex items-center gap-4">
          <Link to="/" className="lg:hidden">
            <div className="py-5 px-5 rounded hover:bg-slate-300">
              <IoChevronBackOutline size={20} />
            </div>
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div className="">
            <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
              {dataUser?.name}
            </h3>
            <p className="-my-2 text-sm">
              {dataUser.online && <span className="text-primary">Online</span>}
            </p>
          </div>
        </div>
        <div>
          <button className="cursor-pointer hover:text-primary">
            <HiDotsVertical />
          </button>
        </div>
      </header>
      {/**Show All Messages */}
      <section className="h-[calc(100vh-128px)]  overflow-x-hidden overflow-y-scroll scrollbar relative">
        {/**Upload Image Display */}
        {message.imageUrl&&(
          <div className="w-full h-full bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
          <div onClick={handleClearPhoto} className="w-fit p-2 absolute top-0 right-0 cursor-pointer text-slate-300 hover:text-primary">
            <IoIosClose size={40}/>
          </div>
          <div className="bg-white p-3 ">
            <img
              src={message.imageUrl}
             
              alt="uploadImage" 
              className="aspect-square h-full w-full max-w-sm m-2 object-scale-down"
            />
          </div>
        </div>
        )}
                {message.videoUrl && (
          <div className="w-full h-full bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div onClick={handleClearVideo} className="w-fit p-2 absolute top-0 right-0 cursor-pointer text-slate-300 hover:text-primary">
              <IoIosClose size={40}/>
            </div>
            <div className="bg-white p-3 ">
              <video src={message.videoUrl}  controls muted autoPlay  className="aspect-square h-full w-full max-w-sm m-2 object-scale-down"/> 
            </div>
          </div>
        )}
        {
          loading&&<Loader />
        }
        Show all messages
      </section>
      {/**Send messages */}
      <section className="h-16 bg-white">
        <div className="relative ">
          <button
            className="flex justify-center items-center w-14 h-14 rounded-full hover:bg-primary"
            onClick={handleImageVideoUpload}
          >
            <GoPlus size={20} />
          </button>
          {/**video and image */}
          {openImageVideoUpload && (
            <div className="bg-white shadow rounded absolute bottom-16 w-36 p-2">
              <form>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-primary">
                    <FaImage size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <label
                  htmlFor="uploadVideo"
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-purple-500">
                    <FaVideo size={18} />
                  </div>
                  <p>Video</p>
                </label>

                <input
                  type="file"
                  id="uploadImage"
                  onChange={handleUploadImage}
                />
                <input
                  type="file"
                  id="uploadVideo"
                  onChange={handleUploadVideo}
                />
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MessagePage;
