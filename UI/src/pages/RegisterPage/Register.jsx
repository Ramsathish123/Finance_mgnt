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
    role: "User",
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
    try {
      const res = await axios.post(
        "https://project1-template-1.onrender.com/register",
        formData
      );
      alert(res.data.message || "Registered successfully!");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Flex className="login-wrapper">
      <Box className="login-card">
        <Stack spacing={5} align="center" mb={4}>
          <Image src="/logo.jpg" alt="Logo" className="login-logo" />

          <Text className="login-title">Create Your Account</Text>
        </Stack>

        <form onSubmit={handleSubmit} className="login-form">
          <Stack spacing={4}>
            <FormControl isRequired>
              <Input
                className="input-primary"
                name="first"
                placeholder="Full Name"
                value={formData.first}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <Input
                className="input-primary"
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <Input
                className="input-primary"
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <Input
                className="input-primary"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <Input
                className="input-primary"
                name="uname"
                placeholder="Username"
                value={formData.uname}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <Select
                className="input-primary"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <InputGroup>
                <Input
                  className="input-primary"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <InputRightElement>
                  <Button
                    className="icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button type="submit" className="btn-primary" size={"sm"}>
              Create Account
            </Button>
          </Stack>
        </form>

        <Text fontSize="sm" textAlign="center" mt={6}>
          Already have an account?{" "}
          <Link color="blue.400" onClick={() => navigate("/")}>
            Sign in
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}
