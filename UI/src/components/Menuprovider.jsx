import { createContext, useContext, useState, useEffect } from "react";
import { useDisclosure, useBreakpointValue } from "@chakra-ui/react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const { isOpen: isMobileMenuOpen, onToggle: toggleMobileMenu } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleMenu = () => {
    if (isMobile) toggleMobileMenu();
    else setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <MenuContext.Provider value={{ isMenuOpen, toggleMenu, isMobileMenuOpen }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};