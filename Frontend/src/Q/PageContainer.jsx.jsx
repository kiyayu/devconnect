import React from "react";
import { Box } from "@chakra-ui/react";

const PageContainer = ({ children }) => {
  return (
    <div className="container mx-auto px-4 flex-grow pt-[9vh]">
      {children}
    </div>
  );
};

export default PageContainer;
