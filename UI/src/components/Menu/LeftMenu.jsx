import React, { useEffect } from "react";
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
import {
  RiBillLine,
  RiMoneyDollarCircleLine,
  RiPieChartLine,
  RiUserAddLine,
  RiToolsLine,
} from "react-icons/ri";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import { getLocalStorageItem } from "../../utils/localStoragesHelper";
import { useMenu } from "../../components/Menuprovider";
import Header from "../../components/Header/Header";
import "../../App.css";
import "../../index.css";

const LeftMenu = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const location = useLocation();
  const { isMenuOpen, toggleMenu, isMobileMenuOpen, toggleMobileMenu } =
    useMenu();
  const storedUser = getLocalStorageItem("user");

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
    console.log("User from localStorage:", storedUser);
  }, []);

  const isActiveLink = (href) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <Flex h="100vh" overflow="hidden" bg="gray.50">
      {/* Sidebar */}
      <Box
        as="nav"
        className={`sidebar ${!isMenuOpen ? "collapsed" : ""} ${
          isMobile && isMobileMenuOpen ? "open" : ""
        }`}
        w={isMobile ? "250px" : isMenuOpen ? "200px" : "70px"}
        position={isMobile ? "fixed" : "relative"}
      >
        <Flex direction="column" h="full">
          {/* Logo */}
          <Flex
            className="sidebar-logo"
            justify={isMenuOpen || isMobile ? "flex-start" : "center"}
          >
            <img src="/logo.png" alt="TechAppzy Logo" />
            {(isMenuOpen || isMobile) && (
              <Box>
                <Text className="sidebar-logo-text">TechAppzy</Text>
                <Text className="sidebar-logo-sub">Business Suite</Text>
              </Box>
            )}
          </Flex>

          {/* Mobile Menu Close */}
          {isMobile && (
            <Flex justify="flex-end" p={2}>
              <IconButton
                icon={<FiX />}
                aria-label="Close menu"
                className="icon-btn"
                onClick={toggleMobileMenu}
              />
            </Flex>
          )}

          {/* Menu Items */}
          <VStack className="sidebar-menu" align="stretch">
            {menuItems.map((item, i) => {
              const active = isActiveLink(item.href);
              return (
                <Tooltip
                  key={i}
                  label={item.label}
                  placement="right"
                  hasArrow
                  isDisabled={isMenuOpen || isMobile}
                  openDelay={300}
                  bg="var(--color-brand-primary)"
                  color="white"
                >
                  <Link
                    as={RouterLink}
                    to={item.href}
                    className={`menu-link ${active ? "active" : ""}`}
                  >
                    <Icon as={item.icon} className="menu-icon" />
                    {(isMenuOpen || isMobile) && <Text>{item.label}</Text>}
                  </Link>
                </Tooltip>
              );
            })}
          </VStack>

          {/* User Info */}
          {(isMenuOpen || isMobile) && storedUser && (
            <Box className="sidebar-user">
              <Text className="sidebar-user-name">
                {storedUser.name || storedUser.email}
              </Text>
              <Text className="sidebar-user-role">{storedUser.role}</Text>
            </Box>
          )}
        </Flex>
      </Box>

      {/* Main Content */}
      <Box flex="1" overflowY="auto">
        <Header />
        <Box p={5}>
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
          zIndex="overlay"
          onClick={toggleMobileMenu}
        />
      )}
    </Flex>
  );
};

export default LeftMenu;
