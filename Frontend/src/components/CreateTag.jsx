// src/components/CreateTag.jsx

import React, { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { createTag, fetchTags } from "../services/api";

const CreateTag = () => {
  const [name, setName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tag name is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await createTag({name});
      setLoading(false);
      setName("");
      
    
    } catch (err) {
      setLoading(false);
      console.error("Error creating tag:", err);
      setError(err.response?.data?.message || "Failed to create tag.");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Create New Tag</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Tag Name *
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter tag name"
            required
          />
        </div>

         

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          ) : (
            "Create Tag"
          )}
        </button>
      </form>
    </div>
  );
};
export default CreateTag;
