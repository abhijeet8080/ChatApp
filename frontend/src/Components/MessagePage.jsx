// MessagePage.js
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { GoPlus } from "react-icons/go";
import { FaImage, FaVideo } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { IoChevronBackOutline } from "react-icons/io5";
import uploadFile from "../Helper/uploadFile";
import { IoIosClose } from "react-icons/io";
import Loader from "./Loader";
import moment from "moment";
import { BiSolidSend } from "react-icons/bi";

const MessagePage = () => {
  const params = useParams();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
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
  const [allMessages, setAllMessages] = useState([]);
  const [error, setError] = useState(null); // To handle server-side errors
  const currentMsg = useRef();

  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );

  useEffect(() => {
    if (currentMsg.current) {
      currentMsg.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allMessages]);

  const handleImageVideoUpload = () => {
    setOpenImageVideoUpload((prev) => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const uploadPhoto = await uploadFile(file);
      setOpenImageVideoUpload(false);

      setMessage((prev) => {
        return {
          ...prev,
          imageUrl: uploadPhoto?.url,
        };
      });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearPhoto = () => {
    setMessage((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  const handleClearVideo = () => {
    setMessage((prev) => ({
      ...prev,
      videoUrl: "",
    }));
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const uploadVideo = await uploadFile(file);
      setOpenImageVideoUpload(false);

      setMessage((prev) => ({
        ...prev,
        videoUrl: uploadVideo?.url,
      }));
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnChange = (e) => {
    const { value } = e.target;

    setMessage((prev) => ({
      ...prev,
      text: value,
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit("new-message", {
          // Remove 'sender' as it's handled server-side
          receiver: params?.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          // 'msgByUserId' is no longer needed; sender is server-validated
        });
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: "",
        });
      }
    }
  };

  useEffect(() => {
    if (socketConnection) {
      // Emit 'message-page' to request user details and conversation
      socketConnection.emit("message-page", params.userId);

      // Listen for 'message-page-data'
      const handleMessagePageData = (data) => {
        if (data.error) {
          console.error(data.error);
          setError(data.error); // Optionally display this error in the UI
        } else {
          setDataUser(data.user);
          if (data.conversation && data.conversation.messages) {
            setAllMessages(data.conversation.messages);
          } else {
            setAllMessages([]);
          }
        }
      };

      // Listen for 'message' events
      const handleNewMessage = (conversation) => {
        if (conversation && conversation.messages) {
          const targetUserId = params.userId.toString();
          const currentUserId = user._id.toString();

          // Determine if the incoming conversation is with the currently viewed user
          const isCurrentConversation =
            (conversation.sender && conversation.sender._id.toString() === targetUserId) ||
            (conversation.receiver && conversation.receiver._id.toString() === targetUserId);

          if (isCurrentConversation) {
            setAllMessages(conversation.messages);
          } else {
            // Optionally, handle other conversations (e.g., show a notification)
            //console.log("Received message for a different conversation. Ignoring.");
          }
        }
      };

      // Listen for 'error' events from the server
      const handleError = (errorData) => {
        console.error("Socket error:", errorData.message);
        setError(errorData.message);
      };

      socketConnection.on("message-page-data", handleMessagePageData);
      socketConnection.on("message", handleNewMessage);
      socketConnection.on("error", handleError);

      // Cleanup listeners on unmount or dependency change
      return () => {
        socketConnection.off("message-page-data", handleMessagePageData);
        socketConnection.off("message", handleNewMessage);
        socketConnection.off("error", handleError);
      };
    }
  }, [socketConnection, params?.userId, user]);

  return (
    <div
      style={{
        backgroundImage: `url(${process.env.REACT_APP_BACKGROUND_IMG})`,
        backgroundSize: 'cover', // Image covers the container
        backgroundPosition: 'center', // Centers the image
        backgroundRepeat: 'no-repeat', // No repeat of the image
        minHeight: '100vh', // Ensure it covers the full screen height
      }}
      className="bg-cover"
    >

      <header className="sticky top-0 h-16 bg-white flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
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
          <div>
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
      <section className=" h-[calc(100vh-128px)] bg-slate-200 bg-opacity-20 overflow-x-hidden overflow-y-scroll scrollbar relative">
        
        {/**Display Error if Any */}
        {error && (
          <div className="bg-red-200 text-red-800 p-2 m-4 rounded">
            {error}
          </div>
        )}

        {/**All messages */}
        <div className="flex flex-col gap-2 py-2 px-2">
          {allMessages.map((msg, index) => (
            <div className={` p-1 py-1 rounded w-fit max-w-[230px] md:max-w-sm lg:max-w-md ${user._id === msg?.msgByUserId ? "ml-auto bg-teal-200" : "bg-white"}`}>

              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="messageImage"
                  className="mt-2 rounded object-cover max-w-[230px] md:max-w-sm lg:max-w-md"
                />
              )}
              {msg.videoUrl && (
                <video
                  src={msg.videoUrl}
                  controls
                  className="mt-2 rounded object-cover max-w-[230px] md:max-w-sm lg:max-w-md"
                />
              )}
              {msg.text && <p className="px-[5px] break-words ">{msg.text}</p>}
              <p className="text-xs ml-auto w-fit mt-1">
                {moment(msg.createdAt).format("hh:mm A")}
              </p>

            </div>
          ))}

          <div ref={currentMsg}></div>

        </div>
        {/**Upload Image Display */}
        {message.imageUrl && (
          
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden ">
          
            <div
              onClick={handleClearPhoto}
              className="w-fit p-2 absolute top-0 right-0 cursor-pointer text-slate-300 hover:text-primary"
            >
              <IoIosClose size={24} />
            </div>
            <div className="bg-white p-3">
              <img
                src={message.imageUrl}
                alt="uploadImage"
                className="aspect-square h-full w-full max-w-sm m-2 object-scale-down"
              />
            </div>
          </div>
        )}
        {message.videoUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden ">
            <div
              onClick={handleClearVideo}
              className="w-fit p-2 absolute top-0 right-0 cursor-pointer text-slate-300 hover:text-primary"
            >
              <IoIosClose size={24} />
            </div>
            <div className="bg-white p-3">
              <video
                src={message.videoUrl}
                controls
                muted
                autoPlay
                className="aspect-square h-full w-full max-w-sm m-2 object-scale-down"
              />
            </div>
          </div>
        )}
        {loading && (
          <div className="w-full h-full sticky bottom-0 flex justify-center items-center">
            <Loader />
          </div>
        )}
      </section>
      {/**Send messages */}
      <section className="h-16 bg-white flex items-center px-4">
        <div className="relative">
          <button
            className="flex justify-center items-center w-14 h-14 rounded-full hover:bg-primary"
            onClick={handleImageVideoUpload}
          >
            <GoPlus size={20} />
          </button>
          {/**video and image */}
          {openImageVideoUpload && (
            <div className="bg-white shadow rounded absolute bottom-16 left-0 w-36 p-2 z-10">
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
                  className="hidden"
                  accept="image/*"
                />
                <input
                  type="file"
                  id="uploadVideo"
                  onChange={handleUploadVideo}
                  className="hidden"
                  accept="video/*"
                />
              </form>
            </div>
          )}
        </div>
        {/***input box */}
        <form className="h-full w-full flex gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            className="py-1 px-4 outline-none w-full h-full border rounded"
            value={message.text}
            onChange={handleOnChange}
          />
          <button
            type="submit"
            className="text-primary hover:text-secondary"
            disabled={!message.text && !message.imageUrl && !message.videoUrl}
          >
            <BiSolidSend size={28} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
