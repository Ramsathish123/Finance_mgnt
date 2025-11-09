import React, { useRef } from "react";
import {
  Box,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Button,
  IconButton,
  useColorMode,
  useColorModeValue,
  VStack,
  HStack,
  useDisclosure,
  Portal,
  Divider,
  useToast,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { FiLogOut, FiMenu, FiUser, FiSettings } from "react-icons/fi";
import { useFileContext } from "../../context/Filecontext";
import { clearAllLocalStorage } from "../../utils/localStoragesHelper";
import { useMenu } from "../../components/Menuprovider";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const profileRef = useRef(null);
  const { users, setUsers } = useFileContext();
  const toast = useToast();
  const { toggleMenu, isMenuOpen } = useMenu(); // Added isMenuOpen

  const handleSignOut = () => {
    clearAllLocalStorage();
    setUsers({});
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
    onClose();
    window.location.href = "/";
  };

  const dropdownBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const searchBg = useColorModeValue("gray.50", "gray.700");
  const searchBorder = useColorModeValue("gray.200", "gray.600");

  return (
    <Flex
      as="header"
      bg="white"
      p={4}
      align="center"
      justify="space-between"
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      {/* Left Section - Menu Toggle */}
      <Tooltip
        label="Toggle menu"
        hasArrow
        bg="#625DF0"
        color="white"
        openDelay={300}
      >
        <IconButton
          onClick={toggleMenu}
          icon={<FiMenu />}
          aria-label="Toggle menu"
          size="md"
          variant="ghost"
          color={"black"}
          _hover={{
            border: "1px solid",
            borderColor: "#625DF0",
            color: "#625DF0",
            transform: "scale(1.05)",
            bg: "transparent",
          }}
          transition="all 0.3s ease"
        />
      </Tooltip>

      {/* Center Section - Search Bar */}
      <Box flex="1" maxW="400px" mx={8}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="#625DF0" />
          </InputLeftElement>
          <Input
            placeholder="Search..."
            bg={searchBg}
            border="1px solid"
            borderColor={searchBorder}
            borderRadius="lg"
            _hover={{
              borderColor: "#625DF0",
              boxShadow: "0 0 0 1px #625DF0",
            }}
            _focus={{
              borderColor: "#625DF0",
              boxShadow: "0 0 0 2px rgba(98, 93, 240, 0.2)",
            }}
            transition="all 0.3s ease"
          />
        </InputGroup>
      </Box>

      {/* Right Section - Icons and Profile */}
      <HStack spacing={2}>
        {/* Dark/Light Mode */}
        <Tooltip
          label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          hasArrow
          bg="#625DF0"
          color="white"
          openDelay={300}
        >
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            size="sm"
            variant="ghost"
            color="gray.600"
            p={2} // Added padding for better spacing
            _hover={{
              border: "1px solid",
              borderColor: "#625DF0",
              color: "#625DF0",
              transform: "scale(1.05)",
              bg: "transparent",
            }}
            transition="all 0.3s ease"
          />
        </Tooltip>

        {/* Profile Menu */}
        <Box ref={profileRef}>
          <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
            <Tooltip
              label="Profile menu"
              hasArrow
              bg="#625DF0"
              color="white"
              openDelay={300}
            >
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                px={3}
                size="sm"
                bg="transparent"
                color="gray.700"
                border="1px solid"
                borderColor="transparent"
                _hover={{
                  borderColor: "#625DF0",
                  color: "#625DF0",
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(98, 93, 240, 0.1)",
                  bg: "transparent",
                }}
                _focus={{
                  boxShadow: "0 0 0 2px rgba(98, 93, 240, 0.2)",
                  bg: "transparent",
                }}
                _active={{
                  bg: "transparent",
                }}
                borderRadius="lg"
                transition="all 0.3s ease"
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={users.username}
                    bg="#625DF0"
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                    border="2px solid"
                    borderColor="transparent"
                    _groupHover={{
                      borderColor: "#625DF0",
                    }}
                  />
                  <Text
                    display={{ base: "none", md: "block" }}
                    fontWeight="medium"
                  >
                    {users.uname || "User"}
                  </Text>
                </HStack>
              </MenuButton>
            </Tooltip>

            <Portal>
              <MenuList
                minW="280px"
                p={0}
                border="1px solid"
                borderColor={borderColor}
                boxShadow="0 10px 40px rgba(98, 93, 240, 0.2)"
                bg={dropdownBg}
                borderRadius="xl"
                overflow="hidden"
                zIndex="modal" // Highest z-index for dropdown
              >
                {/* Profile Header */}
                <Box
                  p={6}
                  bg="linear-gradient(135deg, #625DF0 0%, #8B87EB 100%)"
                  position="relative"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="white"
                    opacity="0.1"
                  />
                  <HStack spacing={3} position="relative" zIndex={1}>
                    <Avatar
                      size="lg"
                      name={users.uname}
                      bg="white"
                      color="#625DF0"
                      fontWeight="bold"
                      border="3px solid"
                      borderColor="white"
                      boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                    />
                    <VStack align="flex-start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg" color="white">
                        {users.username || "Guest User"}
                      </Text>
                      <Text fontSize="sm" color="white" opacity="0.9">
                        {users.email || "example@mail.com"}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Menu Items */}
                <VStack spacing={1} p={3} bg="white">
                  <MenuItem
                    icon={<FiUser />}
                    color="gray.700"
                    _hover={{
                      bg: "gray.50",
                      color: "#625DF0",
                      transform: "translateX(4px)",
                      borderLeft: "3px solid",
                      borderColor: "#625DF0",
                    }}
                    borderRadius="lg"
                    transition="all 0.3s ease"
                    fontWeight="500"
                  >
                    View Profile
                  </MenuItem>

                  <MenuItem
                    icon={<FiSettings />}
                    color="gray.700"
                    _hover={{
                      bg: "gray.50",
                      color: "#625DF0",
                      transform: "translateX(4px)",
                      borderLeft: "3px solid",
                      borderColor: "#625DF0",
                    }}
                    borderRadius="lg"
                    transition="all 0.3s ease"
                    fontWeight="500"
                  >
                    Settings
                  </MenuItem>

                  <Divider my={2} />

                  <MenuItem
                    icon={<FiLogOut />}
                    color="red.500"
                    _hover={{
                      bg: "red.50",
                      color: "red.600",
                      transform: "translateX(4px)",
                      borderLeft: "3px solid",
                      borderColor: "red.500",
                    }}
                    onClick={handleSignOut}
                    borderRadius="lg"
                    transition="all 0.3s ease"
                    fontWeight="500"
                  >
                    Sign Out
                  </MenuItem>
                </VStack>
              </MenuList>
            </Portal>
          </Menu>
        </Box>
      </HStack>
    </Flex>
  );
};

export default Header;
