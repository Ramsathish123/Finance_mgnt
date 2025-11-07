import { useState, useEffect, use } from "react";
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
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { FiMenu, FiX, FiHome, FiFileText, FiTool, FiBox, FiDollarSign, FiBarChart2, FiLogIn, FiAtSign, FiUserPlus } from "react-icons/fi";
import { Outlet, Link as RouterLink } from "react-router-dom";
import Header from "../Header/Header";
import { getLocalStorageItem } from "../../utils/localStoragesHelper";
import { useMenu } from "../../components/Menuprovider";

const LeftMenu = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const storedUser = getLocalStorageItem("user");
  const { isMenuOpen, isMobileMenuOpen } = useMenu();

  const menuItems =
    storedUser?.role === "user"
      ? [
          { icon: FiFileText, label: "Invoice", href: "/invoice" },
          { icon: FiTool, label: "Service", href: "/service" },
        ]
      : [
          { icon: FiHome, label: "Home", href: "/dashboard" },
          { icon: FiFileText, label: "Invoice", href: "/invoice" },
          { icon: FiTool, label: "Service", href: "/service" },
          { icon: FiBox, label: "Stock", href: "/stock" },
          { icon: FiDollarSign, label: "Expense", href: "/expense" },
          { icon: FiBarChart2, label: "Report", href: "/report" },
          { icon: FiUserPlus, label: "register", href: "/register" },
        ];

  useEffect(() => {
    const storedUser = getLocalStorageItem("user");
    console.log("Retrieved user from localStorage:", storedUser);
  }, []);

  return (
    <Flex h="100vh" overflow="hidden">
      <Box
        as="nav"
        bg="gray.800"
        color="white"
        h="100vh"
        position={isMobile ? "fixed" : "relative"}
        left={0}
        top={0}
        zIndex="sticky"
        w={isMobile ? "250px" : isMenuOpen ? "250px" : "80px"} // desktop toggle width
        transition="all 0.3s ease"
        transform={isMobile ? (isMenuOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)"}
      >
        <Flex direction="column" h="full" p={4} overflowY="auto">
          {/* Logo and Neon App Name */}
          <Flex align="center" mb={10} w="full" justify={isMobile ? "flex-start" : "center"} direction="row">
            <Box
              bg="gray.900"
              borderRadius="full"
              boxShadow="0 0 16px #00fff7, 0 0 32px #00fff7"
              p={1}
              mr={isMobile ? 4 : 0}
              transition="margin 0.3s"
            >
              <img
                src="/logo.jpg"
                alt="TechAppzy Logo"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "block",
                  background: "#222",
                  boxShadow: "0 0 12px #00fff7",
                }}
              />
            </Box>
            {(isMobile || isMenuOpen) && (
              <Text
                fontWeight="bold"
                fontSize="2xl"
                letterSpacing="wider"
                color="#00fff7"
                textShadow="0 0 8px #00fff7, 0 0 16px #00fff7, 0 0 32px #0ff"
                fontFamily="Orbitron, Segoe UI, sans-serif"
                ml={2}
                userSelect="none"
              >
                TechAppzy
              </Text>
            )}
          </Flex>

          <VStack align={isMobile ? "flex-start" : "center"} spacing={4}>
            {/* Menu toggle icon at the top */}

            {/* Render the rest of the menu items */}
            {menuItems.map((item, index) => (
              <Tooltip
                key={index}
                label={item.label}
                placement="right"
                hasArrow
                isDisabled={isMobile || isMenuOpen} // Show tooltip only when sidebar is collapsed
                openDelay={300}
              >
                <Link
                  as={RouterLink}
                  to={item.href}
                  display="flex"
                  alignItems="center"
                  p={2}
                  borderRadius="md"
                  w="full"
                  _hover={{ bg: "gray.700", textDecoration: "none" }}
                >
                  <Icon as={item.icon} boxSize={5} />
                  {(isMobile || isMenuOpen) && <Text ml={3}>{item.label}</Text>}
                </Link>
              </Tooltip>
            ))}
          </VStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box flex="1" transition="margin-left 0.3s ease" overflowY="auto">
        <Header />
        <Outlet />
      </Box>
    </Flex>
  );
};

export default LeftMenu;
