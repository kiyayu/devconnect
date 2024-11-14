import { useState, useEffect, useContext, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { BiBarChart, BiUser, BiQuestionMark } from "react-icons/bi";
import { toast } from "react-toastify";
import {
  AiOutlineHeart,
  AiOutlineArrowUp,
  AiOutlineMessage,
  AiOutlineTrophy,
} from "react-icons/ai";
import { GiFalloutShelter, GiTrophyCup } from "react-icons/gi";
import { getToken } from "../auth";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import CreateTag  from "./CreateTag";
import {fetchTags, updateTag, deleteTag} from '../services/api'

const StatCard = ({ title, value, icon }) => {
  return (
    <div
      className="stat-card"
      style={{
        padding: "1rem",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        margin: "1rem",
      }}
    >
      <div style={{ marginBottom: "0.5rem" }}>{icon}</div>
      <h3 style={{ margin: "0.5rem 0" }}>{title}</h3>
      <p style={{ fontSize: "1.5rem", margin: "0" }}>{value}</p>
    </div>
  );
};
const ContributorsList = ({ title, contributors, metric, metricLabel }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <div className="space-y-4">
      {contributors.map((user) => (
        <div key={user._id} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user.profilePicture ? (
              <img
                src={`${user.profilePicture}`}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <BiUser className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">{user[metric]}</span>
            <span className="text-sm text-gray-500">{metricLabel}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = getToken();
        const endpoint =
          user.role === "admin" ? `/auth/admin-dashboard` : `/auth/dashboard`;

        // Make the request using the appropriate endpoint
        const response = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error.response?.data?.message || "Failed to fetch dashboard data"
        );
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return user.role === "admin" ? (
    <AdminDashboardContent data={dashboardData} />
  ) : (
    <UserDashboardContent data={dashboardData} />
  );
};

const UserDashboardContent = ({ data }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    userStats,
    recentActivity,
    activityTimeline,
    allQuestions,
    allAnswers,
  } = data;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Questions"
                value={userStats.totalQuestions}
                icon={<BiBarChart className="h-8 w-8 text-blue-500" />}
              />
              <StatCard
                title="Answers"
                value={userStats.totalAnswers}
                icon={<BiBarChart className="h-8 w-8 text-green-500" />}
              />
              <StatCard
                title="Upvotes"
                value={userStats.totalUpvotes}
                icon={<AiOutlineArrowUp className="h-8 w-8 text-purple-500" />}
              />
              <StatCard
                title="Hearts"
                value={userStats.totalHearts}
                icon={<AiOutlineHeart className="h-8 w-8 text-red-500" />}
              />
              <StatCard
                title="Reward Points"
                value={userStats.totalRewardPoints}
                icon={<GiTrophyCup className="h-8 w-8 text-yellow-500" />}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Recent Questions</h2>
                <div className="space-y-4">
                  {recentActivity.questions.map((question) => (
                    <div key={question._id} className="border-b pb-4">
                      <h3 className="font-medium text-gray-800">
                        {question.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(question.createdAt))}{" "}
                          ago
                        </span>
                        <span className="flex items-center">
                          <AiOutlineHeart className="w-4 h-4 mr-1" />
                          {question.reactionCounts?.heart || 0}
                        </span>
                        <span className="flex items-center">
                          <AiOutlineArrowUp className="w-4 h-4 mr-1" />
                          {question.reactionCounts?.upvote || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Recent Answers</h2>
                <div className="space-y-4">
                  {recentActivity.answers.map((answer, index) => (
                    <div key={index} className="border-b pb-4">
                      <p className="text-gray-800">
                        {answer.body.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(answer.createdAt))} ago
                        </span>
                        <span className="flex items-center">
                          <AiOutlineHeart className="w-4 h-4 mr-1" />
                          {answer.reactionCounts?.heart || 0}
                        </span>
                        <span className="flex items-center">
                          <AiOutlineArrowUp className="w-4 h-4 mr-1" />
                          {answer.reactionCounts?.upvote || 0}
                        </span>
                        <span className="flex items-center">
                          <GiTrophyCup className="w-4 h-4 mr-1" />
                          {answer.rewardPoints || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {activityTimeline.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div
                      className={`mt-2 w-2 h-2 rounded-full ${
                        activity.type === "question"
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.type === "question"
                          ? "Posted a question:"
                          : "Posted an answer:"}
                      </div>
                      <div className="mt-1 text-gray-700">
                        {activity.content}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(activity.date))} ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case "questions":
        return <QuestionTable questions={allQuestions} />;
      case "answers":
        return <AnswerTable answers={allAnswers} />;
      default:
        return null;
    }
  };

  const QuestionTable = ({ questions }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Answers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reactions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((question) => (
              <tr key={question._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{question.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {question.author.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {question.answers.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <span className="flex items-center">
                      <AiOutlineHeart className="h-4 w-4 mr-1" />
                      {question.reactionCounts?.heart || 0}
                    </span>
                    <span className="flex items-center">
                      <AiOutlineArrowUp className="h-4 w-4 mr-1" />
                      {question.reactionCounts?.upvote || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(question.createdAt))} ago
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AnswerTable = ({ answers }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Answer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reactions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {answers.map((answer) => (
              <tr key={answer._id}>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {answer.body.substring(0, 100)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {answer.author.name}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <span className="flex items-center">
                      <AiOutlineHeart className="h-4 w-4 mr-1" />
                      {answer.reactionCounts?.heart || 0}
                    </span>
                    <span className="flex items-center">
                      <AiOutlineArrowUp className="h-4 w-4 mr-1" />
                      {answer.reactionCounts?.upvote || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {answer.rewardPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {["overview", "questions", "answers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

// First, let's modify the AdminDashboardContent component to include tabs and new tables

const AdminDashboardContent = ({ data }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    platformStats,
    topContributors,
    recentQuestions,
    allUsers,
    allQuestions,
    allAnswers,
    tags,
  } = data;

 
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={platformStats.totalUsers}
                icon={<BiUser className="h-8 w-8 text-blue-500" />}
              />
              <StatCard
                title="Total Questions"
                value={platformStats.totalQuestions}
                icon={<BiQuestionMark className="h-8 w-8 text-green-500" />}
              />
              <StatCard
                title="Total Answers"
                value={platformStats.totalAnswers}
                icon={<AiOutlineMessage className="h-8 w-8 text-purple-500" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ContributorsList
                title="Top Questioners"
                contributors={topContributors.byQuestions}
                metric="questionCount"
                metricLabel="Questions"
              />
              <ContributorsList
                title="Top Answerers"
                contributors={topContributors.byAnswers}
                metric="answerCount"
                metricLabel="Answers"
              />
              <ContributorsList
                title="Top Point Earners"
                contributors={topContributors.byPoints}
                metric="totalPoints"
                metricLabel="Points"
              />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Recent Questions</h2>
              <div className="space-y-4">
                {recentQuestions.map((question) => (
                  <div key={question._id} className="border-b pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {question.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            {formatDistanceToNow(new Date(question.createdAt))}{" "}
                            ago
                          </span>
                          <span>by {question.author.name}</span>
                          <span>{question.answerCount} answers</span>
                        </div>
                      </div>
                      {question.author.profilePicture && (
                        <img
                          src={`${question.author.profilePicture}`}
                          alt="Profile"
                          className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case "users":
        return <UsersTable users={allUsers} />;
      case "questions":
        return <QuestionsTable questions={allQuestions} />;
      case "answers":
        return <AnswersTable answers={allAnswers} />;
      case "tags":
        return <AdminTags tags={tags} />; // Fixed the component name and props
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {["overview", "users", "questions", "answers", "tags"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

const AdminTags = () => {
  const [allTags, setAllTags] = useState([]);
  const [editedTag, setEditedTag] = useState(null);
  const [currentTagId, setCurrentTagId] = useState(null);
  const [name, setName] = useState("");
  const containerRef = useRef(null);

  // Fetch all tags from the backend
  const fetchAllTags = async () => {
    try {
      const response = await fetchTags();
      setAllTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  // Handle form submission for updating a tag
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateTag({ id: editedTag, tagData: { name } });
      fetchAllTags();
      setEditedTag(null);
      setCurrentTagId(null);
      setName("");
    } catch (error) {
      console.error("Error updating tag:", error);
    }
  };

  // Enter edit mode and pre-fill the form with current tag name
  const handleUpdate = (tag) => {
    setEditedTag(tag._id);
    setName(tag.name);
    setCurrentTagId(null);
  };

  // Toggle display of update and delete buttons
  const handleTagClick = (tagId) => {
    setCurrentTagId((prevId) => (prevId === tagId ? null : tagId));
  };

  // Delete a tag and refresh the list
  const handleDelete = async (id) => {
    try {
      await deleteTag(id);
      fetchAllTags();
      setCurrentTagId(null);
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  // Handle click outside of tag component to hide buttons
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setCurrentTagId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchAllTags();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-lg shadow p-6 flex gap-3 w-full h-64"
    >
      <div ref={containerRef} className="flex-[.5]">
        <CreateTag />
      </div>
      <div ref={containerRef} className="flex flex-1 overflow-auto">
        {allTags.length > 0 &&
          allTags.map((tag) => (
            <div key={tag._id} className="p-3 shadow-lg self-start">
              {editedTag === tag._id ? (
                <form onSubmit={handleSubmitUpdate}>
                  <input
                    type="text"
                    value={name}
                    placeholder="Tag name"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="text-sm bg-green-500 p-2 rounded-lg"
                    >
                      Submit Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedTag(null);
                        setCurrentTagId(null);
                        setName("");
                      }}
                      className="text-sm p-2 rounded-lg bg-red-500 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p
                    onClick={() => handleTagClick(tag._id)}
                    className="p-2 rounded-lg bg-green-500 cursor-pointer"
                  >
                    {tag.name}
                  </p>

                  {tag._id === currentTagId && (
                    <div className="flex w-36 py-2 justify-between items-center gap-3">
                      <button
                        onClick={() => handleUpdate(tag)}
                        className="bg-white text-sm p-3 shadow-lg border rounded-lg text-green-500"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(tag._id)}
                        className="bg-white text-sm p-3 shadow-lg border rounded-lg text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};



const UsersTable = ({ users }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Questions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Answers
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reactions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reward Points
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {user.profilePicture ? (
                    <img
                      src={` ${user.profilePicture}`}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <BiUser className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.questionCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.answerCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.totalReactions}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.rewardPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const QuestionsTable = ({ questions }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Answers
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reactions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {questions.map((question) => (
            <tr key={question._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{question.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {question.author.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {question.answers.length}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2">
                  <span className="flex items-center">
                    <AiOutlineHeart className="h-4 w-4 mr-1" />
                    {question.reactionCounts?.heart || 0}
                  </span>
                  <span className="flex items-center">
                    <AiOutlineArrowUp className="h-4 w-4 mr-1" />
                    {question.reactionCounts?.upvote || 0}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(question.createdAt))} ago
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AnswersTable = ({ answers }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Answer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Question
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reactions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reward Points
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {answers.map((answer) => (
            <tr key={answer._id}>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {answer.body.substring(0, 100)}...
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {answer.author.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{answer.body}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2">
                  <span className="flex items-center">
                    <AiOutlineHeart className="h-4 w-4 mr-1" />
                    {answer.reactionCounts?.heart || 0}
                  </span>
                  <span className="flex items-center">
                    <AiOutlineArrowUp className="h-4 w-4 mr-1" />
                    {answer.reactionCounts?.upvote || 0}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {answer.rewardPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Dashboard;
