import {
  Box,
  Flex,
  Spacer,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  IconButton,
  layout
} from '@chakra-ui/react';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Header = () => {
  return (
    <Box bg="gray.100" px={4} py={2} boxShadow="sm">
      <Flex align="center">
        <Text fontWeight="bold" fontSize="xl">
          My App
        </Text>
        <Spacer />
        <Menu>
          <MenuButton as={IconButton} icon={<Avatar size="sm" />} variant="ghost" />
          <MenuList>
            <MenuItem icon={<FiUser />}>Profile</MenuItem>
            <MenuItem icon={<FiLogOut />}>Sign Out</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default layout;
