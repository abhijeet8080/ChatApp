import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Loader from "./Loader";
import UserSearchCard from "./UserSearchCard";
import toast from "react-hot-toast";
import axios from "axios";
import { IoIosClose } from "react-icons/io";

const SearchUser = ({onClose}) => {
  const [searchUser, setSearchUser] = useState([]);
  const [loading, setLoading] = useState(false); // Set initial loading to false
  const [search, setSearch] = useState("");

  const handleSearchUser = async (searchQuery) => {
    const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/search-user`;
    setLoading(true); // Set loading to true when starting search
    try {
      const response = await axios.post(Url, {
        search: searchQuery,
      });
      setSearchUser(response.data.data);
      setLoading(false); // Set loading to false after successful fetch
    } catch (error) {
      setLoading(false); // Set loading to false on error
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    // Call the search function whenever the input changes
    const debounceTimeout = setTimeout(() => {
      handleSearchUser(search.trim() ? search : ""); // Send an empty string if search is empty
    }, 300); // Debounce for 300ms

    return () => clearTimeout(debounceTimeout); // Cleanup timeout
  }, [search]);

//   //console.log(searchUser);

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10">
      <div className="w-full max-w-lg mx-auto mt-10">
        {/* Input search user */}
        <div className="bg-white rounded h-14 flex overflow-hidden">
          <input
            type="text"
            placeholder="Search user by name or email"
            className="w-full outline-none py-1 h-full px-4"
            onChange={(e) => setSearch(e.target.value)} // Use onChange for input
            value={search}
          />
          <div className="h-14 w-14 flex justify-center items-center">
            <FaSearch size={25} />
          </div>
        </div>

        <div className="bg-white mt-2 w-full p-4 rounded">
          {/* No user found */}
          {searchUser.length === 0 && !loading && (
            <p className="text-center text-slate-500">No user found</p>
          )}
          {loading && <Loader />}
          {searchUser.length !== 0 && !loading &&
            searchUser.map((user) => {
              return <UserSearchCard key={user._id} user={user} onClose={onClose} />;
            })}
        </div>
      </div>
      <div className="absolute top-2 text-white  right-0 text-2xl  p-2 lg:text-4xl hover:text-slate-400" onClick={onClose}>
        <button>
            <IoIosClose size={50}/> 
        </button>
      </div>
    </div>
  );
};

export default SearchUser;
