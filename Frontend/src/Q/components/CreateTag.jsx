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

const CreateTag = ({ onTagCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tag name is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await createTag({ name, description });
      setLoading(false);
      toast({
        title: "Tag Created",
        description: `Tag "${response.data.name}" has been created successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setName("");
      setDescription("");
      onTagCreated(response.data); // Callback to update tag list
    } catch (err) {
      setLoading(false);
      console.error("Error creating tag:", err);
      setError(err.response?.data?.message || "Failed to create tag.");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create tag.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="md"
      boxShadow="md"
      maxW="500px"
      mx="auto"
    >
      <Heading size="md" mb={4} textAlign="center">
        Create New Tag
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="name" mb={4} isRequired>
          <FormLabel>Tag Name</FormLabel>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter tag name"
          />
        </FormControl>

        <FormControl id="description" mb={4}>
          <FormLabel>Tag Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter tag description (optional)"
          />
        </FormControl>

        {error && (
          <Box mb={4} color="red.500">
            {error}
          </Box>
        )}

        <Button
          type="submit"
          colorScheme="green"
          width="full"
          isDisabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "Create Tag"}
        </Button>
      </form>
    </Box>
  );
};

export default CreateTag;
