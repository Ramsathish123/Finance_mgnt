import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  IconButton,
  useBreakpointValue,
  VStack,
  Link,
  Text,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiFileText,
  FiTool,
  FiBox,
  FiDollarSign,
  FiBarChart2,
  FiLogIn,
  FiAtSign,
  FiUserPlus,
} from "react-icons/fi";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";

import { getLocalStorageItem } from "../../utils/localStoragesHelper";
import { useMenu } from "../../components/Menuprovider";

import {
  RiBillLine,
  RiMoneyDollarCircleLine,
  RiPieChartLine,
  RiUserAddLine,
  RiToolsLine,
} from "react-icons/ri";
import Header from "../../components/Header/Header";

const LeftMenu = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const location = useLocation();
  const { isMenuOpen, toggleMenu, isMobileMenuOpen, toggleMobileMenu } =
    useMenu();

  const storedUser = getLocalStorageItem("user");

  // Modern Ri Icons - Very catchy and modern
  const menuItems =
    storedUser?.role === "user"
      ? [
          { icon: RiBillLine, label: "Invoice", href: "/invoice" },
          { icon: RiToolsLine, label: "Service", href: "/service" },
        ]
      : [
          { icon: FiHome, label: "Dashboard", href: "/dashboard" },
          { icon: RiBillLine, label: "Invoice", href: "/invoice" },
          { icon: RiToolsLine, label: "Service", href: "/service" },
          { icon: FiBox, label: "Stock", href: "/stock" },
          { icon: RiMoneyDollarCircleLine, label: "Expense", href: "/expense" },
          { icon: RiPieChartLine, label: "Report", href: "/report" },
          { icon: RiUserAddLine, label: "Register", href: "/register" },
        ];

  useEffect(() => {
    const storedUser = getLocalStorageItem("user");
    console.log("Retrieved user from localStorage:", storedUser);
  }, []);

  const isActiveLink = (href) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  return (
    <Flex h="100vh" overflow="hidden" bg="gray.50">
      {/* Sidebar */}
      <Box
        as="nav"
        bg="white"
        color="gray.700"
        h="100vh"
        position={isMobile ? "fixed" : "relative"}
        left={0}
        top={0}
        zIndex="banner" // Changed to banner for better stacking
        w={isMobile ? "280px" : isMenuOpen ? "230px" : "80px"}
        transition="all 0.3s ease"
        boxShadow="2xl" // Stronger shadow for sidebar only
        borderRight="1px solid"
        borderColor="gray.200"
        transform={
          isMobile
            ? isMobileMenuOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)"
        }
      >
        <Flex direction="column" h="full" p={4} overflowY="auto">
          {/* Logo and App Name */}
          <Flex
            align="center"
            mb={8}
            w="full"
            justify={isMobile || isMenuOpen ? "flex-start" : "center"}
            direction="row"
            position="relative"
          >
            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="0 4px 12px rgba(98, 93, 240, 0.15)"
              mr={isMobile || isMenuOpen ? 3 : 0}
              transition="all 0.3s"
              border="1px solid"
              borderColor="gray.100"
            >
              <img
                src="/logo.jpg"
                alt="TechAppzy Logo"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  display: "block",
                  background: "white",
                }}
              />
            </Box>
            {(isMobile || isMenuOpen) && (
              <Box flex="1">
                <Text
                  fontWeight="bold"
                  fontSize="xl"
                  color="#625DF0"
                  fontFamily="Poppins, sans-serif"
                  userSelect="none"
                >
                  TechAppzy
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontFamily="Inter, sans-serif"
                  userSelect="none"
                >
                  Business Suite
                </Text>
              </Box>
            )}
          </Flex>

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Flex justify="flex-end" mb={4}>
              <IconButton
                aria-label="Close menu"
                icon={<FiX />}
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                color="gray.500"
                _hover={{ bg: "#625DF0", color: "white" }}
              />
            </Flex>
          )}

          {/* Menu Items */}
          <VStack
            align={isMobile || isMenuOpen ? "flex-start" : "center"}
            spacing={2}
            flex="1"
          >
            {menuItems.map((item, index) => {
              const isActive = isActiveLink(item.href);
              return (
                <Tooltip
                  key={index}
                  label={item.label}
                  placement="right"
                  hasArrow
                  isDisabled={isMobile || isMenuOpen}
                  openDelay={300}
                  bg="#625DF0"
                  color="white"
                >
                  <Link
                    as={RouterLink}
                    to={item.href}
                    display="flex"
                    alignItems="center"
                    p={3}
                    borderRadius="lg"
                    w="full"
                    bg={isActive ? "#625DF0" : "transparent"}
                    color={isActive ? "white" : "gray.700"}
                    _hover={{
                      bg: isActive ? "#625DF0" : "#625DF0",
                      color: "white",
                      textDecoration: "none",
                      transform: "translateX(4px)",
                      boxShadow: "0 4px 12px rgba(98, 93, 240, 0.3)",
                    }}
                    transition="all 0.3s ease"
                    boxShadow={
                      isActive ? "0 4px 12px rgba(98, 93, 240, 0.3)" : "none"
                    }
                    position="relative"
                    fontWeight={isActive ? "600" : "500"}
                  >
                    <Icon
                      as={item.icon}
                      boxSize={5}
                      color={isActive ? "white" : "gray.600"}
                      _hover={{
                        color: "white",
                      }}
                      sx={{
                        ".chakra-link:hover &": {
                          color: "white !important",
                        },
                      }}
                    />
                    {(isMobile || isMenuOpen) && (
                      <Text
                        ml={3}
                        fontSize="sm"
                        fontWeight="inherit"
                        _hover={{
                          color: "white",
                        }}
                      >
                        {item.label}
                      </Text>
                    )}
                  </Link>
                </Tooltip>
              );
            })}
          </VStack>

          {/* User Info Footer */}
          {(isMobile || isMenuOpen) && storedUser && (
            <Box
              mt={6}
              p={3}
              borderRadius="lg"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="sm" fontWeight="600" color="gray.700">
                {storedUser.name || storedUser.email}
              </Text>
              <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                {storedUser.role}
              </Text>
            </Box>
          )}
        </Flex>
      </Box>

      {/* Main Content */}
      <Box
        flex="1"
        transition="all 0.3s ease"
        overflowY="auto"
        ml={isMobile ? 0 : isMenuOpen ? 0 : 0} // Remove ml to prevent shifting
        w={isMobile ? "100%" : "100%"} // Full width always
      >
        <Header />
        <Box p={6}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.600"
          zIndex="overlay" // Higher than sidebar
          onClick={toggleMobileMenu}
        />
      )}
    </Flex>
  );
};

export default LeftMenu;
