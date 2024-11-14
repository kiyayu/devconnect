import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const UpdateQuestionModal = ({ 
  isOpen, 
  onClose, 
  question, 
  availableTags, 
  onUpdate 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        body: question.body,
        tags: question.tags.map(tag => tag._id)
      });
    }
  }, [question]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagChange = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  

    try {
      setLoading(true);
      await onUpdate(question._id, formData);
      onClose();
      toast.success('Question updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };
 

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 200, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 50 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Update Question
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInput}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Question title"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInput}
                  rows="6"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Question description"
                ></textarea>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableTags.map((tag) => (
                    <label
                      key={tag._id}
                      className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag._id)}
                        onChange={() => handleTagChange(tag._id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Question"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateQuestionModal;