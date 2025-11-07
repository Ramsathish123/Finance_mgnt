import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useColorModeValue,
  Image,
  Link,
  Select,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first: "",
    email: "",
    mobile: "",
    address: "",
    uname: "",
    password: "",
    role: "User", // default role
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { first, email, mobile, address, uname, password, role } = formData;

    if (!first || !email || !mobile || !address || !uname || !password || !role) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:9988/register", {
        first,
        email,
        mobile,
        address,
        uname,
        password,
        role, // ✅ send role in payload
      });

      alert(response.data.message || "Registered successfully!");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const inputStyles = {
    bg: useColorModeValue("gray.50", "gray.700"),
    borderColor: useColorModeValue("blue.100", "blue.700"),
    _focus: {
      borderColor: "blue.400",
      boxShadow: "0 0 0 1px #4299e1",
    },
    size: "lg",
    fontSize: "md",
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      px={2}
      position="relative"
      _before={{
        content: '""',
        position: "fixed",
        top: 0,
        left: 0,
        w: "100vw",
        h: "100vh",
        zIndex: 0,
        bgImage: "url('/bglogin.avif')",
        bgSize: "cover",
        bgPosition: "center",
        filter: "blur(2px) brightness(0.7)",
      }}
    >
      <Box
        w={{ base: "100%", sm: "440px", md: "460px", lg: "480px" }}
        p={{ base: 4, sm: 8 }}
        bg={useColorModeValue("rgba(255,255,255,0.95)", "rgba(26,32,44,0.95)")}
        boxShadow="2xl"
        borderRadius="2xl"
        zIndex={1}
        backdropFilter="auto"
        backdropBlur="8px"
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        transition="all 0.3s"
      >
        <Stack spacing={6} align="center" mb={6}>
          <Image
            boxSize="70px"
            src="/logo.jpg"
            alt="ClaudeBox Logo"
            objectFit="contain"
            borderRadius="full"
            border="2px solid"
            borderColor="blue.400"
            bg="white"
            shadow="md"
          />
          <Heading
            fontSize={{ base: "2xl", sm: "2.5xl" }}
            textAlign="center"
            color={useColorModeValue("blue.700", "blue.200")}
            fontWeight="extrabold"
          >
            Create Your ClaudeBox Account
          </Heading>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="first" isRequired>
              <FormLabel color={useColorModeValue("blue.700", "blue.200")}>Name</FormLabel>
              <Input
                name="first"
                placeholder="Enter Your Name"
                value={formData.first}
                onChange={handleChange}
                {...inputStyles}
              />
            </FormControl>

            <FormControl id="email" isRequired>
              <FormLabel color={useColorModeValue("blue.700", "blue.200")}>Email address</FormLabel>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                {...inputStyles}
              />
            </FormControl>

            <FormControl id="mobile" isRequired>
              <FormLabel color={useColorModeValue("blue.700", "blue.200")}>Mobile No.</FormLabel>
              <Input
                type="tel"
                name="mobile"
                placeholder="+91-9999999999"
                value={formData.mobile}
                onChange={handleChange}
                {...inputStyles}
              />
            </FormControl>

            <FormControl id="address" isRequired>
              <FormLabel color={useColorModeValue("blue.700", "blue.200")}>Address</FormLabel>
              <Input
                name="address"
                placeholder="Street, City, Zip"
                value={formData.address}
                onChange={handleChange}
                {...inputStyles}
              />
            </FormControl>

            <FormControl id="uname" isRequired>
              <FormLabel color={useColorModeValue("blue.700", "blue.200")}>User Name</FormLabel>
              <Input
                name="uname"
                placeholder="Enter User Name"
                value={formData.uname}
                onChange={handleChange}
                {...inputStyles}
              />
            </FormControl>

            {/* ✅ Role Dropdown */}
            <FormControl id="role" isRequired>
              <FormLabel color={useColorModeValue("blue.700", "blue.200")}>Role</FormLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                {...inputStyles}
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </Select>
            </FormControl>

            {/* Password Field */}
            <FormControl id="password" isRequired>
              <FormLabel color={useColorModeValue("blue.700", "blue.200")}>Password</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  {...inputStyles}
                />
                <InputRightElement>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    size="sm"
                    tabIndex={-1}
                    color={useColorModeValue("blue.500", "blue.200")}
                    _hover={{ bg: "transparent" }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              fontWeight="bold"
              w="full"
              borderRadius="full"
              shadow="md"
              _hover={{
                bg: "blue.600",
                transform: "translateY(-2px) scale(1.03)",
                boxShadow: "lg",
              }}
              transition="all 0.2s"
            >
              Create Account
            </Button>
          </Stack>
        </form>

        <Text fontSize="sm" textAlign="center" mt={6} color={useColorModeValue("gray.600", "gray.400")}>
          Already have an account?{" "}
          <Link
            color="blue.400"
            fontWeight="bold"
            onClick={() => navigate("/")}
            _hover={{ textDecoration: "underline" }}
          >
            Sign in
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}
