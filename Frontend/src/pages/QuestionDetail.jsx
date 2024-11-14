// src/Q/pages/QuestionDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { FaArrowUp, FaHeart, FaComments } from "react-icons/fa";
import { MdSend, MdClose, MdAdd } from "react-icons/md";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
 import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To access passed state
  const { user } = useContext(AuthContext);
  const [question, setQuestion] = useState(location.state?.question || null); // Use state if available
  const [answerBody, setAnswerBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [answerFile, setAnswerFile] = useState(null);
  const [isLoading, setIsLoading] = useState(!question); // Set loading state if no question passed
  const [error, setError] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [answerId, setAnserId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editableAnswerId, setEditableAnswerId] = useState(null);

  // update  PUT /api/questions/:questionId/answers/:answerId
  // DELETE /api/questions/:questionId/answers/:answerId
 
  const handleFormModal = () => {
    if (formModal) {
      // Reset all states when closing the modal
      setAnswerBody("");
      setAnswerFile(null);
      setEditMode(false);
      setEditableAnswerId(null);
    }
    setFormModal(!formModal);
  };
  const handleReplayModal = () => {
    setReplyModal(!replyModal);
  };

  useEffect(() => {
    if (!question) {
      const getQuestion = async () => {
        try {
          setIsLoading(true);
          const response = await api.get(`/questions/${id}`);
          console.log("Fetched question data:", response.data); // Debugging line
          if (response.data && response.data.author) {
            setQuestion(response.data);
          } else {
            setError("Author information is missing.");
          }
        } catch (error) {
          console.error("Error fetching question:", error);
          setError("Failed to load question. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      getQuestion();
    }
  }, [id, question]);

  /**
   * @desc    Handle adding a reaction to an entity
   * @param   {String} onModel - "Question" or "Answer"
   * @param   {String} on - The ID of the question or answer
   * @param   {String} type - "upvote" or "heart"
   */
  const handleAddReaction = async (onModel, on, type) => {
    try {
      await api.post("/reactions", { onModel, on, type });
      const updatedQuestion = await api.get(`/questions/${id}`);
      setQuestion(updatedQuestion.data);
      toast.success(`You have ${type}d this ${onModel.toLowerCase()}.`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("An error occurred while adding the reaction.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Submit new answer or update existing answer based on mode
 const handleAnswerSubmit = async (e) => {
   e.preventDefault();
   if (!answerBody.trim()) {
     toast.error("Please enter your answer.");
     return;
   }

   try {
     const formData = new FormData();
     formData.append("body", answerBody.trim());
     if (answerFile) formData.append("file", answerFile);

     let response;
     if (editMode && editableAnswerId) {
       // Update existing answer
       response = await api.put(
         `/questions/${id}/answers/${editableAnswerId}`,
         { body: answerBody.trim() } // Send as JSON if no file
       );
       toast.success("Answer updated successfully");
     } else {
       // Create new answer
       response = await api.post(`/questions/${id}/answers`, formData);
       toast.success("Answer submitted successfully");
     }

     // Refresh question data
     const updatedQuestion = await api.get(`/questions/${id}`);
     setQuestion(updatedQuestion.data);

     // Reset form state
     setAnswerBody("");
     setAnswerFile(null);
     setEditMode(false);
     setEditableAnswerId(null);
     setFormModal(false);
   } catch (error) {
     console.error("Error submitting answer:", error);
     toast.error(error.response?.data?.message || "Failed to submit answer");
   }
 };
  // Toggle edit mode and set current answer body
const handleEditAnswer = (answer) => {
  setEditMode(true);
  setEditableAnswerId(answer._id);
  setAnswerBody(answer.body);
  setFormModal(true);
};

  const handleAnswerDelete = async (answerid) => {
      if (!window.confirm("Are you sure you want to delete this question?")) {
        return;
      }
    try {
      await api.delete(`/questions/${id}/answers/${answerid}`);
      toast.success("Your answer has been deleted.", {
        position: "top-right",
        autoClose: 3000,
      });
      // Refresh question data
      const updatedQuestion = await api.get(`/questions/${id}`);
      setQuestion(updatedQuestion.data);
    } catch (error) {
      console.error("Error deleting answer:", error);
      toast.error("Failed to delete answer. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyBody.trim()) {
      toast.error("Please enter your answer.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    try {
      const response = api.post(
        `/questions/${id}/answers/${answerId}/replies`,
        replyBody
      );
      toast.success("Your reply has been added.", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 bg-slate-100 min-h-screen mx-auto md:w-2/3 sm:w-full relative">
      {question && (
        <>
          {/* Back to Questions Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Questions
          </button>

          {/* Question Details */}
          <div className="flex items-center mb-4">
            <img
              src={
                question.author?.profilePicture
                  ? ` ${question.author.profilePicture}`
                  : defaultProfilePic
              }
              alt={question.author?.name || "Unknown"}
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-sm text-gray-500">
                Asked by {question.author?.name || "Unknown"}  
               <span> </span> <span>
                  {formatDistanceToNow(new Date( question.createdAt))} ago
                </span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-gray-700">{question.body}</p>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {question.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Reactions on Question */}
          <div className="flex items-center mt-4 mb-6">
            <button
              onClick={() =>
                handleAddReaction("Question", question._id, "upvote")
              }
              className={`flex items-center mr-4 ${
                question.reactionCounts?.upvote > 0
                  ? "text-green-600"
                  : "text-gray-500"
              } hover:text-green-700`}
              aria-label="Upvote Question"
            >
              <FaArrowUp size={20} />
              <span className="ml-1">
                {question.reactionCounts?.upvote || 0}
              </span>
            </button>

            <button
              onClick={() =>
                handleAddReaction("Question", question._id, "heart")
              }
              className={`flex items-center mr-4 ${
                question.reactionCounts?.heart > 0
                  ? "text-red-600"
                  : "text-gray-500"
              } hover:text-red-700`}
              aria-label="Heart Question"
            >
              <FaHeart size={20} />
              <span className="ml-1">
                {question.reactionCounts?.heart || 0}
              </span>
            </button>

            <Link
              to={`/questions/${question._id}`}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <FaComments size={20} />
              <span className="ml-1">{question.answerCount} Answers</span>
            </Link>
          </div>

          {/* Answers Section */}
          <h3 className="text-xl font-semibold mb-4">Answers</h3>
          <div className="space-y-4">
            {question.answers && question.answers.length > 0 ? (
              question.answers.map((answer) => (
                <div key={answer._id} className="bg-white p-4 rounded shadow">
                  <div className="flex items-center mb-2">
                    <img
                      src={
                        answer.author?.profilePicture
                          ? ` ${answer.author.profilePicture}`
                          : defaultProfilePic
                      }
                      alt={answer.author?.name || "Unknown"}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                    <p className="font-semibold">
                      {answer.author?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 ml-2">
                      <span>
                        {formatDistanceToNow(new Date(answer.createdAt))} ago
                      </span>
                    </p>
                  </div>
                  <p className="text-gray-700 mb-2">{answer.body}</p>

                  {answer.file && (
                    <a
                      href={` ${answer.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Attachment
                    </a>
                  )}

                  {/* Reactions on Answer */}
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() =>
                        handleAddReaction("Answer", answer._id, "upvote")
                      }
                      className={`flex items-center mr-4 ${
                        answer.reactionCounts?.upvote > 0
                          ? "text-green-600"
                          : "text-gray-500"
                      } hover:text-green-700`}
                      aria-label="Upvote Answer"
                    >
                      <FaArrowUp size={16} />
                      <span className="ml-1">
                        {answer.reactionCounts?.upvote || 0}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        handleAddReaction("Answer", answer._id, "heart")
                      }
                      className={`flex gap-2 items-center mr-4 ${
                        answer.reactionCounts?.heart > 0
                          ? "text-red-600"
                          : "text-gray-500"
                      } hover:text-red-700`}
                      aria-label="Heart Answer"
                    >
                      <FaHeart size={16} />
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium text-amber-600">
                          Reward Points:
                        </span>
                        <span className="inline-flex items-center px-3 py-1 text-sm font-bold text-green-700 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-full shadow-sm hover:shadow-md transition-all">
                          {answer.rewardPoints}
                          <svg
                            className="w-4 h-4 ml-1 text-amber-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </span>
                      </span>
                    </button>
                  </div>
                  {/*delte and update section */}
                  {/* Edit/Delete buttons */}
                  {user &&
                    (answer.author._id === user.userId ||
                      user.role === "admin") && (
                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={() => handleAnswerDelete(answer._id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleEditAnswer(answer)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No answers yet.</p>
            )}
          </div>

          {/* Add Answer Button */}
          {user ? (
            <button
              onClick={handleFormModal}
              className="fixed bottom-10 right-10 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 flex items-center justify-center"
              aria-label="Add Answer"
            >
              <MdAdd size={24} />
            </button>
          ) : (
            <div className="mt-8">
              <p className="text-gray-700">
                You must be logged in to submit an answer.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Answer Modal */}
          {/* Answer Modal */}
          {formModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              onClick={handleFormModal}
            >
              <motion.div
                className="bg-white w-11/12 md:w-2/5 lg:w-1/3 p-6 rounded-lg shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleFormModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <MdClose size={24} />
                </button>
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                  {editMode ? "Update Your Answer" : "Submit Your Answer"}
                </h2>
                <form onSubmit={handleAnswerSubmit}>
                  <textarea
                    placeholder="Your answer..."
                    value={answerBody}
                    onChange={(e) => setAnswerBody(e.target.value)}
                    className="w-full p-3 border rounded-md mb-4"
                    rows={4}
                  ></textarea>
                  <input
                    type="file"
                    onChange={(e) => setAnswerFile(e.target.files[0])}
                    className="w-full mb-4"
                    accept=".jpeg,.jpg,.png,.pdf,.mp4,.mp3"
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-green-600"
                  >
                    {editMode ? "Update Answer" : "Submit Answer"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </>
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

export default QuestionDetail;
