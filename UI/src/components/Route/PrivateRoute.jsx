import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useFileContext } from "../../context/Filecontext";
import { getLocalStorageItem } from "../../utils/localStoragesHelper";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";

const isValidUser = (user) => {
  return user && typeof user === "object" && (user.email || user.uname);
};

const PrivateRoute = () => {
  const { users } = useFileContext();
  const localUser = getLocalStorageItem("user") || users;
  const navigate = useNavigate();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const navigationType = performance.getEntriesByType("navigation")[0]?.type;

    if (!isValidUser(localUser)) {
      if (navigationType !== "reload") {
        // User tried to access the route manually
        setShowModal(true);
      }
    }

    // Track that the app has been loaded once
    isFirstLoad.current = false;
  }, [location]);

  if (showModal) {
    return (
      <Modal isOpen={true} onClose={() => {}} istopped>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Session Expired</ModalHeader>
          <ModalBody>
            <Text>
              Your session has expired. Please log in again to continue.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => navigate("/")}>
              Login
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return isValidUser(localUser) ? <Outlet /> : null;
};

export default PrivateRoute;
