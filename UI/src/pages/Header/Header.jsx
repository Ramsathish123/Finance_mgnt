import React, { useRef } from "react";
import {
  Box,
  Flex,
  Heading,
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
} from "@chakra-ui/react";
import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useFileContext } from "../../context/Filecontext";
import { clearAllLocalStorage } from "../../utils/localStoragesHelper";
import { useMenu } from "../../components/Menuprovider";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const profileRef = useRef(null);
  const { users, setUsers } = useFileContext();
  const toast = useToast();
  const { toggleMenu } = useMenu();

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

  const bg = useColorModeValue("white", "gray.900");
  const dropdownBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "blue.900");

  return (
    <Box as="header" className="app-header" bg={bg}>
      <Flex align="center" justify="space-between" w="100%">
        <Heading
          as="h1"
          size="md"
          fontWeight="semibold"
          color={useColorModeValue("gray.800", "white")}
          letterSpacing="tight"
        >
          {/* Dashboard */}
        </Heading>

        <HStack spacing={3}>
          {/* Menu Toggle */}
          <IconButton
            onClick={toggleMenu}
            icon={<FiMenu />}
            aria-label="Toggle menu"
            size="sm"
            variant="ghost"
            color={useColorModeValue("blue.600", "blue.300")}
            _hover={{
              bg: hoverBg,
              color: useColorModeValue("blue.700", "blue.100"),
            }}
            borderRadius="full"
          />

          {/* Dark/Light Mode */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            size="sm"
            variant="ghost"
            color={useColorModeValue("blue.600", "blue.300")}
            _hover={{
              bg: hoverBg,
              color: useColorModeValue("blue.700", "blue.100"),
            }}
            borderRadius="full"
          />

          {/* Profile Menu */}
          <Box ref={profileRef}>
            <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                px={3}
                size="sm"
                bg="transparent"
                color={useColorModeValue("blue.700", "white")}
                _hover={{
                  bg: "transparent",
                }}
                _focus={{
                  boxShadow: "none",
                  bg: "transparent",
                }}
                _active={{
                  bg: "transparent",
                }}
                borderRadius="full"
              >
                <HStack spacing={2}>
                  <Avatar size="sm" name={users.username} bg="green.400" />
                  <Text
                    display={{ base: "none", md: "block" }}
                    fontWeight="medium"
                    color={useColorModeValue("blue.700", "gray.200")}
                  >
                    {users.uname || "User"}
                  </Text>
                </HStack>
              </MenuButton>

              <Portal>
                <MenuList
                  minW="260px"
                  p={0}
                  border="1px solid"
                  borderColor={borderColor}
                  boxShadow="xl"
                  bg={dropdownBg}
                >
                  <Box p={4}>
                    <HStack spacing={3}>
                      <Avatar size="md" name={users.uname} bg="green.400" />
                      <VStack align="flex-start" spacing={0}>
                        <Text
                          fontWeight="bold"
                          fontSize="md"
                          color={useColorModeValue("gray.800", "white")}
                        >
                          {users.username || "Guest"}
                        </Text>
                        <Text
                          fontSize="sm"
                          color={useColorModeValue("gray.500", "gray.400")}
                        >
                          {users.email || "example@mail.com"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  <Divider />

                  <VStack spacing={1} p={2}>
                    <MenuItem
                      icon={<FiLogOut />}
                      color={useColorModeValue("blue.600", "blue.300")}
                      _hover={{
                        bg: useColorModeValue("blue.50", "blue.900"),
                      }}
                      onClick={handleSignOut}
                      borderRadius="md"
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
    </Box>
  );
};

export default Header;
