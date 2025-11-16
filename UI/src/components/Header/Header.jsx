import React, { useRef, useMemo } from "react";
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
  useColorMode,
  Skeleton,
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
import "../../App.css";
import "../../index.css";


const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const profileRef = useRef(null);
  const { users: contextUsers = {}, setUsers } = useFileContext() || {};
  const toast = useToast();
  const { toggleMenu } = useMenu();

  // fallback: try to read user object from common localStorage keys
  const localUserFallback = useMemo(() => {
    try {
      const candidates = ["users", "user", "currentUser"];
      for (let key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (err) {
      // ignore parse errors
    }
    return null;
  }, []);

  // Merge context user and fallback (context takes precedence)
  const users = useMemo(() => {
    if (contextUsers && Object.keys(contextUsers).length > 0) {
      return contextUsers;
    }
    return localUserFallback || {};
  }, [contextUsers, localUserFallback]);

  // Normalize display values
  const displayName =
    users?.username ||
    users?.name ||
    users?.fullName ||
    users?.uname ||
    "Guest User";
  const displayUname = users?.uname || users?.username || users?.name || "User";
  const displayEmail =
    users?.email || users?.mail || users?.userEmail || "example@mail.com";

  const handleSignOut = () => {
    clearAllLocalStorage();
    try {
      if (setUsers) setUsers({});
    } catch (e) {
      // ignore
    }
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

  // If no user data at all, show a small skeleton for avatar/text to avoid layout jump
  const isEmptyUser = !users || Object.keys(users).length === 0;

  return (
    <Flex as="header" className="app-header">
      {/* Left - Menu Toggle */}
      <Tooltip
        label="Toggle menu"
        hasArrow
        bg="var(--color-brand-primary)"
        color="white"
        openDelay={300}
      >
        <IconButton
          onClick={toggleMenu}
          icon={<FiMenu />}
          aria-label="Toggle menu"
          className="icon-btn"
        />
      </Tooltip>

      {/* Center - Search */}
      <Box className="header-search">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="var(--color-brand-primary)" />
          </InputLeftElement>
          <Input placeholder="Search..." />
        </InputGroup>
      </Box>

      {/* Right - Icons & Profile */}
      <HStack className="header-actions">
        <Tooltip
          label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          hasArrow
          bg="var(--color-brand-primary)"
          color="white"
          openDelay={300}
        >
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            className="icon-btn"
          />
        </Tooltip>

        {/* Profile Menu */}
        <Box ref={profileRef}>
          <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
            <Tooltip
              label="Profile menu"
              hasArrow
              bg="var(--color-brand-primary)"
              color="white"
              openDelay={300}
            >
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                className="profile-menu-btn"
              >
                <HStack spacing={2}>
                  {isEmptyUser ? (
                    <Skeleton circle height="28px" width="28px" />
                  ) : (
                    <Avatar
                      size="sm"
                      name={displayName}
                      bg="var(--color-brand-primary)"
                      color="white"
                    />
                  )}

                  {isEmptyUser ? (
                    <Skeleton height="16px" width="60px" />
                  ) : (
                    <Text display={{ base: "none", md: "block" }}>
                      {displayUname}
                    </Text>
                  )}
                </HStack>
              </MenuButton>
            </Tooltip>

            <Portal>
              <MenuList className="profile-dropdown">
                <Box className="profile-dropdown-header">
                  <HStack spacing={3} position="relative" zIndex={1}>
                    {isEmptyUser ? (
                      <Skeleton circle height="44px" width="44px" />
                    ) : (
                      <Avatar
                        size="lg"
                        name={displayName}
                        bg="white"
                        color="var(--color-brand-primary)"
                      />
                    )}

                    <VStack align="flex-start" spacing={1}>
                      {isEmptyUser ? (
                        <>
                          <Skeleton height="14px" width="120px" />
                          <Skeleton height="12px" width="160px" />
                        </>
                      ) : (
                        <>
                          <Text fontWeight="bold" fontSize="lg" color="white">
                            {displayName}
                          </Text>
                          <Text fontSize="sm" color="white" opacity="0.9">
                            {displayEmail}
                          </Text>
                        </>
                      )}
                    </VStack>
                  </HStack>
                </Box>

                <VStack spacing={1} p={3}>
                  <MenuItem icon={<FiUser />} className="menu-item">
                    View Profile
                  </MenuItem>
                  <MenuItem icon={<FiSettings />} className="menu-item">
                    Settings
                  </MenuItem>
                  <Divider my={2} />
                  <MenuItem
                    icon={<FiLogOut />}
                    onClick={handleSignOut}
                    className="menu-item logout"
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
