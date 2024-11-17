import React, { useEffect, useState } from "react";
import {
  MdEdit,
  MdClose,
  MdSave,
  MdPerson,
  MdGroup,
  MdBlock,
  MdAccessTime,
} from "react-icons/md";
import { toast } from "react-toastify";
import { getToken } from "../auth";
import { userProfile, updateUserProfile } from "../services/api";
import moment from "moment";
import IncomingRequests from "../components/IncomingRequests";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePicture: null,
    age: "",
    status: "offline",
    lastSeen: null,
    role: "member",
    friends: [],
    blockedUsers: [],
    createdAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePicture: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userProfile();
        setUser(response.data);
        setFormData({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          profilePicture: response.data.profilePicture || null,
        });
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        profilePicture: file,
      });

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUser((prev) => ({
            ...prev,
            profilePicture: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await updateUserProfile(formDataToSend);

      setUser(response.data);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const defaultProfilePicture = "https://via.placeholder.com/150";

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        <div className="relative">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-3xl font-bold text-white">Profile</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-full hover:bg-white/30 flex items-center transition-all duration-300"
              >
                <MdEdit className="mr-2" /> Edit Profile
              </button>
            ) : (
              <div className="space-x-3">
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 text-white px-6 py-2.5 rounded-full hover:bg-green-600 flex items-center inline-flex transition-all duration-300"
                >
                  <MdSave className="mr-2" /> Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-500 text-white px-6 py-2.5 rounded-full hover:bg-gray-600 flex items-center inline-flex transition-all duration-300"
                >
                  <MdClose className="mr-2" /> Cancel
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-8 text-center">
                <div className="relative inline-block">
                  <img
                    src={user.profilePicture || defaultProfilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover ring-4 ring-white shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white cursor-pointer hover:bg-blue-600 transition-all duration-300">
                    <MdEdit className="text-xl" />
                    <input
                      type="file"
                      onChange={handleChange}
                      name="profilePicture"
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "name", type: "text" },
                  { name: "email", type: "email" },
                  { name: "phone", type: "tel" },
                  { name: "address", type: "text" },
                  { name: "age", type: "number" },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-gray-700 font-medium capitalize">
                      {field.name}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      required={field.name === "name" || field.name === "email"}
                      min={field.name === "age" ? "13" : undefined}
                    />
                  </div>
                ))}
              </div>
            </form>
          ) : (
            <div>
              <div className="text-center mb-8">
                <div className="inline-block relative">
                  <img
                    src={user.profilePicture || defaultProfilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover ring-4 ring-white shadow-lg"
                  />
                  <div
                    className={`absolute bottom-4 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      user.status === "online"
                        ? "bg-green-500"
                        : user.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                </div>
                <h3 className="text-2xl font-bold mt-4">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {user.role}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <MdPerson className="text-gray-500 mr-2" />
                    <p className="text-gray-500 text-sm">Personal Info</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    Age: {user.age || "Not provided"}
                  </p>
                  <p className="font-semibold text-gray-800">
                    Phone: {user.phone || "Not provided"}
                  </p>
                  <p className="font-semibold text-gray-800">
                    Address: {user.address || "Not provided"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <MdGroup className="text-gray-500 mr-2" />
                    <p className="text-gray-500 text-sm">Connections</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    Friends: {user.friends?.length || 0}
                  </p>
                  <p className="font-semibold text-gray-800">
                    Blocked: {user.blockedUsers?.length || 0}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <MdAccessTime className="text-gray-500 mr-2" />
                    <p className="text-gray-500 text-sm">Activity</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    Last Seen:{" "}
                    {user.lastSeen ? moment(user.lastSeen).fromNow() : "N/A"}
                  </p>
                  <p className="font-semibold text-gray-800">
                    Joined: {moment(user.createdAt).format("MMMM YYYY")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <IncomingRequests />
      </div>
    </div>
  );
};

export default Profile;
