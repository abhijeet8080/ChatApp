import React, { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import uploadFile from "../Helper/uploadFile";
import Divider from "./Divider";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
const EditUserDetails = ({ onClose, user }) => {
    const dispatch = useDispatch();
  const [data, setData] = useState({
    name: user?.name || "",
    profile_pic: user?.profile_pic || "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const uploadPhotoRef = useRef();

  useEffect(() => {
    setData({
      name: user?.name || "",
      profile_pic: user?.profile_pic || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenUploadPhoto = () => {
    if (uploadPhotoRef.current) {
      uploadPhotoRef.current.click();
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadedPhoto = await uploadFile(file);
      setData((prev) => ({
        ...prev,
        profile_pic: uploadedPhoto?.url || prev.profile_pic,
      }));
    } catch (err) {
      console.error("Error uploading photo:", err);
      setError("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the file input value to allow uploading the same file again if needed
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("No authentication token found. Please log in.");
            return;
        }

        const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/update-user`;
        const response = await axios.post(Url, {
            token: token,
            name: data.name,
            profile_pic: data.profile_pic
        });
        // //console.log(response)
        toast.success(response.data.message);
        if(response.data.success){

            dispatch(setUser(response?.data?.data))
            onClose(); 
        }

      
    } catch (error) {
        console.error("Error updating user details:", error);

        // Check if the error response exists
        if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("An unexpected error occurred. Please try again.");
        }
    }
};


  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10">
      <div className="bg-white p-6 m-1 rounded w-full max-w-sm">
        <h2 className="font-semibold text-lg">Profile Details</h2>
        <p className="text-sm text-gray-600">Edit User</p>

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm">
              Name:
            </label>
            <input
              className="w-full py-2 px-3 border rounded focus:outline-primary"
              type="text"
              name="name"
              id="name"
              value={data.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm">Photo:</label>
            <div className="my-2 flex items-center gap-4">
              <Avatar
                width={50}
                height={50}
                name={data.name}
                imageUrl={data.profile_pic}
              />
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={handleOpenUploadPhoto}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Change Photo"}
              </button>
              <input
                type="file"
                id="profile_pic"
                className="hidden"
                ref={uploadPhotoRef}
                accept="image/*"
                onChange={handleUploadPhoto}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <Divider />

          <div className="flex gap-4 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-primary text-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition"
              disabled={isUploading}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserDetails);
