import React from "react";
import {
  Box,
  Flex,
  Image,
  Avatar,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Button,
} from "@chakra-ui/react";

export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Dummy user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
  };

  const handleSignOut = () => {
    console.log("User signed out");
    // Add actual sign-out logic here
    onClose();
  };

  return (
    <>
      <Flex
        as="header"
        bg="blue.500"
        color="white"
        p={4}
        align="center"
        justify="space-between"
        boxShadow="md"
      >
        {/* Logo */}
        <Box>
          <Image src="/logo.jpg" alt="TechAppzy Logo" h="40px" />
        </Box>

        {/* Profile Icon */}
        <IconButton
          icon={<Avatar size="sm" name={user.name} />}
          variant="ghost"
          onClick={onOpen}
          aria-label="Open Profile"
        />
      </Flex>

      {/* Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text fontWeight="bold">Name:</Text>
            <Text mb={3}>{user.name}</Text>

            <Text fontWeight="bold">Email:</Text>
            <Text mb={4}>{user.email}</Text>

            <Button colorScheme="red" onClick={handleSignOut} width="100%">
              Sign Out
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}