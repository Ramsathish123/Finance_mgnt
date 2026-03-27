import React from "react";
import { Box } from "@chakra-ui/react";
const SideBar = () => {
  return (
    <Box w={{ base: "0", md: "250px" }} display={{ base: "none", md: "block" }}>
      <h1>SideBar</h1>
    </Box>
  );
};

export default SideBar;
