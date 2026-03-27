import { createContext, useContext, useState, useEffect } from "react";
import { useDisclosure, useBreakpointValue } from "@chakra-ui/react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // Mobile menu
  const {
    isOpen: isMobileMenuOpen,
    onOpen: openMobileMenu,
    onClose: closeMobileMenu,
    onToggle: toggleMobileMenu,
  } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleMenu = () => {
    if (isMobile) {
      toggleMobileMenu();
    } else {
      setIsMenuOpen((prev) => !prev);
    }
  };

  // Collapse desktop menu initially
  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <MenuContext.Provider
      value={{
        isMenuOpen,
        toggleMenu,
        isMobileMenuOpen,

        // expose these so LeftMenu can close mobile menu
        openMobileMenu,
        closeMobileMenu,
        toggleMobileMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
