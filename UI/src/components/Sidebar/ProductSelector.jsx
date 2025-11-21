import {
  Box,
  Input,
  Flex,
  Button,
  Spinner,
  Text,
  useColorModeValue,
  Card,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import axios from "axios";

const ProductSelector = ({ onAdd }) => {
  const [productList, setProductList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const dropdownBg = useColorModeValue("white", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "gray.600");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/all`
      );
      setProductList(res.data || []);
      setFilteredList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value) => {
    setQuery(value);
    setIsOpen(true);

    if (value.trim() === "") {
      setFilteredList(productList);
      return;
    }

    const filtered = productList.filter((p) =>
      p.productName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredList(filtered);
  };

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setQuery(product.productName);
    setIsOpen(false);
  };

  const handleAddClick = () => {
    if (!selectedProduct) return;
    const product = {
      ...selectedProduct,
      quantity: quantity,
      amount: parseFloat(selectedProduct.rate) * quantity,
    };
    onAdd(product);
    setSelectedProduct(null);
    setQuery("");
    setQuantity(1);
  };

  return (
    <Card p={4} mb={6} borderColor={borderColor} borderWidth="1px" shadow="md">
      <Flex align="center" gap={3} position="relative" flexWrap="wrap">
        {/* Search Input */}
        <Box position="relative" w={{ base: "100%", md: "320px" }}>
          <Input
            placeholder="Search or select product..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)} // small delay for click
            size="sm"
            borderColor="gray.300"
            bg="white"
            autoComplete="off"
          />

          {/* Dropdown list */}
          {isOpen && (
            <Box
              position="absolute"
              top="100%"
              left="0"
              w="100%"
              bg={dropdownBg}
              border="1px solid"
              borderColor={borderColor}
              mt="2"
              borderRadius="md"
              boxShadow="xl"
              zIndex={10}
              maxH="200px"
              overflowY="auto"
            >
              {isLoading ? (
                <Flex align="center" justify="center" p={3}>
                  <Spinner size="sm" mr={2} /> <Text>Loading products...</Text>
                </Flex>
              ) : filteredList.length > 0 ? (
                filteredList.map((p) => (
                  <Flex
                    key={p.productId}
                    px={3}
                    py={2}
                    align="center"
                    justify="space-between"
                    _hover={{ bg: hoverBg }}
                    cursor="pointer"
                    onMouseDown={() => handleSelect(p)}
                  >
                    <Text fontSize="sm" fontWeight="500" isTruncated>
                      {p.productName}
                    </Text>
                    <Text fontSize="sm" color="blue.500" flexShrink={0}>
                      ₹{Number(p.rate).toFixed(2)}
                    </Text>
                  </Flex>
                ))
              ) : (
                <Text textAlign="center" p={3} color="gray.500" fontSize="sm">
                  No matching products found
                </Text>
              )}
            </Box>
          )}
        </Box>

        {/* Quantity */}
        <Input
          w="80px"
          size="sm"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        {/* Add Button */}
        <Button
          colorScheme="blue"
          size="sm"
          leftIcon={<FiPlus />}
          onClick={handleAddClick}
          isDisabled={!selectedProduct}
        >
          Add
        </Button>
      </Flex>
    </Card>
  );
};

export default ProductSelector;
