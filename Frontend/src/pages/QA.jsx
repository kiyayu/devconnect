// components/QA.jsx

import React, { useEffect, useState, useContext , useRef} from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaHeart,
  FaRegHeart,
  FaComments,
} from "react-icons/fa";
import { MdSend, MdClose, MdMoreVert } from "react-icons/md";
import { motion } from "framer-motion";
import {
  fetchQuestions,
  createQuestion,
  deleteQuestion,
  updateQuestion ,
  fetchTags,
  reactToEntity,
} from "../services/api"; // Ensure these functions are correctly implemented
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Ensure AuthContext provides user info
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify"; // Import toast from React Toastify
import "react-toastify/dist/ReactToastify.css"; // Import React Toastify CSS
import UpdateQuestionModal from "./UpdateQuestionModal";
import api from '../services/api'
import { FaFilter, FaTimes } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import Connection from "../components/Connection";

const Sidebar = ({
  tags,
  onTagSelect,
  onSearch,
  selectedTags,
  onClearFilters,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const maxVisibleTags = 10;

  // Debounce search to improve performance
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  // Sort tags by question count
  const sortedTags = [...tags].sort(
    (a, b) => (b.questionCount || 0) - (a.questionCount || 0)
  );

  const visibleTags = showAllTags
    ? sortedTags
    : sortedTags.slice(0, maxVisibleTags);

  return (
    <aside
      className={`
        ${isMobileOpen ? "fixed" : "hidden"}
        md:fixed md:block
        w-52 bg-white text-sm shadow-md p-4 h-[90vh] left-0 top-[9vh]
        overflow-y-auto z-50
        transition-transform duration-300 ease-in-out
      `}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onCloseMobile}
        className="md:hidden absolute top-0 z-40 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close sidebar"
      >
        <FaTimes size={24} />
      </button>

      {/* Search Form */}
      <div className="sticky top-2 right-0 bg-white pt-2 pb-4 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search questions"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <FaTimes size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {selectedTags.length > 0 && (
        <div className="mb-4 mt-3 ">
          <div className="flex items-center  justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">
              Active Filters
            </h4>
            <button
              onClick={onClearFilters}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagId) => {
              const tag = tags.find((t) => t._id === tagId);
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                >
                  {tag?.name}
                  <button
                    onClick={() => onTagSelect(tagId)}
                    className="ml-1 hover:text-blue-900"
                    aria-label={`Remove ${tag?.name} filter`}
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-lg mb-4 mt-5 flex items-center">
          <FaFilter className="mr-2" />
          Categories
        </h3>
        <div className="space-y-2">
          {visibleTags.map((tag) => (
            <button
              key={tag._id}
              onClick={() => onTagSelect(tag._id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg 
                transition-colors flex items-center justify-between
                ${
                  selectedTags.includes(tag._id)
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }
              `}
            >
              <span className="flex items-center truncate"># {tag.name}</span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full ml-2">
                {tag.questionCount || 0}
              </span>
            </button>
          ))}
        </div>

        {tags.length > maxVisibleTags && (
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm w-full text-center"
          >
            {showAllTags
              ? "Show Less"
              : `Show ${tags.length - maxVisibleTags} More`}
          </button>
        )}
      </div>
    </aside>
  );
};
const QA = () => {
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState({ title: "", body: "", tags: [] });
  const [questionModal, setQuestionModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useContext(AuthContext); // Assuming user object contains _id and role
  const [moreId, setMoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const dropdownRef = useRef(null);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reactingTo, setReactingTo] = useState(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    
      const [showProfile, setShowProfile] = useState(false);
   const hanldeShowProfile = async (userId) => {
     console.log("Fetching user ID:", userId); // Add this to check the ID
     try {
       const response = await api.get(`/auth/users/${userId}`);
       const data = await response.data; // Correctly retrieve data (not `response.json()`)
       console.log("Fetched user data:", data); // Add this to debug the response
       setSelectedUser(data);
       setShowProfile(true);
     } catch (error) {
       console.error("Error fetching user details:", error);
     }
   };


  // Enhanced search function
  const handleSearch = (term) => {
    setSearchTerm(term);
    filterQuestions(term, selectedTags);
  };

  // Enhanced tag selection
  const handleTagSelect = (tagId) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId];
      filterQuestions(searchTerm, newTags);
      return newTags;
    });
  };

  // Combined filter function
  const filterQuestions = (searchTerm, tags) => {
    let filtered = [...questions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tag filters
    if (tags.length > 0) {
      filtered = filtered.filter((question) =>
        question.tags.some((tag) => tags.includes(tag._id))
      );
    }

    setFilteredQuestions(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setFilteredQuestions(questions);
  };

  // Mobile sidebar controls
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleModal = () => {
    setQuestionModal(!questionModal);
    setError("");
    setSuccess("");
  };

   

  const handleMore = (id) => {
    setMoreId((prevId) => (prevId === id ? null : id));
  };

  const handleInput = (e) => {
    setQuestion({ ...question, [e.target.name]: e.target.value });
  };

  const handleTagChange = (selectedTags) => {
    setQuestion({ ...question, tags: selectedTags });
  };

  // Handle Question Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.title || !question.body) {
      toast.error("Please fill in all fields.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await createQuestion(question);
      setLoading(false);

      // Ensure reactions array exists
      const newQuestion = {
        ...response.data,
        reactions: response.data.reactions || [], // Default to empty array if undefined
      };

      setQuestions([newQuestion, ...questions]); // Prepend the new question
      toast.success("Question successfully posted.", {
        position: "top-right",
        autoClose: 3000,
      });
      handleModal(); // Close modal
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleUpdate = async (questionId, updatedData) => {
    try {
      setLoading(true);
      const response = await updateQuestion(questionId, updatedData);

      if (response.data) {
        // Update questions state with the updated question
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) => (q._id === questionId ? response.data : q))
        );
        setUpdateModalOpen(false);
        setSelectedQuestion(null);
        toast.success("Question updated successfully!");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update question. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }
    try {
      setLoading(true);
      await deleteQuestion(id);
      setLoading(false);
      toast.success("Question successfully deleted.", {
        position: "top-right",
        autoClose: 3000,
      });
      getQuestions(); // Refresh the questions list
    } catch (error) {
      setLoading(false);
      console.error("Error deleting question:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the question.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  // Fetch questions
  const getQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchQuestions();

      setQuestions(response.data.questions); // Ensure backend sends { questions: [...] }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Fetch available tags on component mount
  useEffect(() => {
    const getTags = async () => {
      try {
        const response = await fetchTags();
        setAvailableTags(response.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    getTags();
  }, []);

  useEffect(() => {
    getQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * @desc    Handle adding a reaction to a question
   * @param   {String} questionId - The ID of the question
   * @param   {String} reactionType - The type of reaction (e.g., "upvote")
   */

  // Update handleAddReaction
  const handleAddReaction = async (questionId, reactionType) => {
    if (reactingTo) return; // Prevent multiple simultaneous reactions

    try {
      setReactingTo(questionId);
      await api.post("/reactions", {
        onModel: "Question",
        on: questionId,
        type: reactionType,
      });

      await getQuestions();

      toast.success(`You have ${reactionType}d this question.`);
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("An error occurred while adding the reaction.");
    } finally {
      setReactingTo(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMoreId(null);
      }
    };

    if (moreId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreId]);

  /**
   * @desc    Get reaction counts and user-specific reactions
   * @param   {Array} reactions - The reactions array from the question
   * @returns {Object} - An object containing counts and user-specific reactions
   */
  const processReactions = (reactions) => {
    const reactionCounts = { upvote: 0 };
    const userReactions = {};

    // Check if reactions exists and is an array
    if (!reactions || !Array.isArray(reactions)) {
      return { reactionCounts, userReactions };
    }

    reactions.forEach((reaction) => {
      // Count upvotes
      if (reaction.type === "upvote") {
        reactionCounts.upvote = (reactionCounts.upvote || 0) + 1;
      }

      // Track if the current user has upvoted
      if (reaction.type === "upvote" && reaction.userId === user?.userId) {
        userReactions.upvote = true;
      }
    });

    return { reactionCounts, userReactions };
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen relative">
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-16 left-4 z-50 bg-white p-2 rounded-full shadow-md"
      >
        <FaFilter size={20} />
      </button>
      {showProfile && (
        <Connection user={selectedUser} close={() => setShowProfile(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        tags={availableTags}
        onTagSelect={handleTagSelect}
        onSearch={handleSearch}
        selectedTags={selectedTags}
        onClearFilters={clearFilters}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Add Question Button */}
      <button
        onClick={handleModal}
        className="fixed bottom-10 z-10 right-10 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 flex items-center justify-center"
        aria-label="Add Question"
      >
        <MdSend size={24} />
      </button>

      {/* Question Modal */}
      {questionModal && (
        <motion.div
          initial={{ y: 200, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 50 }}
          className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white w-11/12 md:w-2/5 lg:w-1/3 p-6 rounded-lg shadow-lg relative">
            {/* Close Icon */}
            <button
              onClick={handleModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <MdClose size={24} />
            </button>

            {/* Modal Heading */}
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
              Add Your Question Here
            </h2>

            {/* Question Form */}
            <form onSubmit={handleSubmit}>
              {/* Title Input */}
              <div className="mb-4">
                <input
                  type="text"
                  name="title"
                  value={question.title}
                  onChange={handleInput}
                  placeholder="Title"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Body Textarea */}
              <div className="mb-4">
                <textarea
                  name="body"
                  value={question.body}
                  onChange={handleInput}
                  placeholder="Your question here"
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                ></textarea>
              </div>

              {/* Tags Selection */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Select Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <label key={tag._id} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={tag._id}
                        checked={question.tags.includes(tag._id)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          if (checked) {
                            setQuestion({
                              ...question,
                              tags: [...question.tags, value],
                            });
                          } else {
                            setQuestion({
                              ...question,
                              tags: question.tags.filter(
                                (tagId) => tagId !== value
                              ),
                            });
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-green-600"
                      />
                      <span className="ml-2 text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <MdSend size={20} className="mr-2" />
                    Submit
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-orange-500 text-white p-2 rounded-md text-center">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mt-4 bg-blue-500 text-white p-2 rounded-md text-center">
                  {success}
                </div>
              )}
            </form>
          </div>
        </motion.div>
      )}
      {/* Update Question Modal */}
      <UpdateQuestionModal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setSelectedQuestion(null);
        }}
        question={selectedQuestion}
        availableTags={availableTags}
        onUpdate={handleUpdate}
      />

      {/* Questions Heading */}
      <h1 className="text-3xl font-bold text-center mb-6">Questions</h1>

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center items-center mt-10">
          {/* Tailwind CSS Spinner */}
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((questionItem) => {
              const { reactionCounts, userReactions } = processReactions(
                questionItem.reactions
              );

              return (
                <div
                  key={questionItem._id}
                  className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto hover:shadow-lg transition-shadow duration-200 relative"
                >
                  {/* More Options Icon */}
                  {(questionItem.author._id === user.userId ||
                    user.role === "admin") && (
                    <button
                      onClick={() => handleMore(questionItem._id)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                      aria-label="More options"
                    >
                      <MdMoreVert size={24} />
                    </button>
                  )}

                  {/* Options Dropdown */}
                  {moreId === questionItem._id && (
                    <div className="absolute top-12 right-4 bg-gray-700 text-white rounded-md shadow-lg z-20">
                      <Link
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedQuestion(questionItem);
                          setUpdateModalOpen(true);
                          setMoreId(null);
                        }}
                        className="block px-4 py-2 hover:bg-gray-600"
                      >
                        Update
                      </Link>
                      <button
                        onClick={() => handleDelete(questionItem._id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Author Information */}
                  <div className="flex items-center mb-4">
                    <img
                      onClick={() => hanldeShowProfile(questionItem.author._id)}
                      src={
                        questionItem.author?.profilePicture
                          ? ` ${questionItem.author.profilePicture}`
                          : defaultProfilePic
                      }
                      alt={questionItem.author?.name || "Unknown User"}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <p onClick={hanldeShowProfile} className="font-semibold">
                        {questionItem.author?.name || "Unknown User"}
                      </p>
                     
                      <p className="text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(
                            new Date(questionItem.createdAt)
                          )}{" "}
                          ago
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Question Title and Body */}
                  <h2 className="text-2xl font-semibold mb-2">
                    {questionItem.title}
                  </h2>
                  <p className="text-gray-700 mb-4">{questionItem.body}</p>

                  {/* Tags */}
                  {questionItem.tags && questionItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {questionItem.tags.map((tag) => (
                        <span
                          key={tag._id}
                          className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reactions Section */}
                  <div className="flex items-center mb-4">
                    {/* Upvote Button */}
                    <button
                      onClick={() =>
                        handleAddReaction(questionItem._id, "upvote")
                      }
                      className={`flex items-center mr-4 ${
                        userReactions.upvote
                          ? "text-green-600 bg-green-50"
                          : "text-gray-500 hover:text-green-600"
                      } px-2 py-1 rounded-md transition-colors`}
                      disabled={loading || reactingTo === questionItem._id}
                      aria-label="Upvote"
                    >
                      <FaArrowUp
                        size={20}
                        className={
                          userReactions.upvote ? "transform scale-110" : ""
                        }
                      />
                      <span className="ml-1">{reactionCounts.upvote || 0}</span>
                    </button>

                    {/* Answer Count */}
                    <Link
                      to={`/questions/${questionItem._id}`}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <FaComments size={20} />
                      <span className="ml-1">
                        {questionItem.answerCount} Answers
                      </span>
                    </Link>
                  </div>

                  {/* View Details Button */}
                  <Link to={`/questions/${questionItem._id}`}>
                    <button className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center">
                      View Details
                    </button>
                  </Link>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-600">No questions available.</p>
          )}
        </div>
      )}
    </div>
  );
};

// Tailwind CSS Spinner Styles (Add to your global CSS file, e.g., index.css)
/*
.loader {
  border-top-color: #3498db;
  animation: spinner 1.5s linear infinite;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}
*/

export default QA;
