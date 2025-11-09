import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  useDisclosure,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  useColorModeValue,
  Stack,
  Card,
  useToast,
  Tooltip,
  Spinner,
  Text,
  HStack,
} from "@chakra-ui/react";
import { FiTrash2, FiPlus, FiEye, FiTrash } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";

const Stock = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [stockItems, setStockItems] = useState([]);
  const toast = useToast();
  const [deleteItemId, setDeleteItemId] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const modalSize = useBreakpointValue({ base: "full", md: "lg" });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  const [newItem, setNewItem] = useState({
    productId: "",
    name: "",
    rate: "",
    qty: "",
    gst: "",
    addQty: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  // Reusable border colors
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableBorderColor = "gray.200"; // #e2e8f0 equivalent in Chakra
  const rowBorderColor = useColorModeValue("gray.100", "gray.500");

  useEffect(() => {
    fetchStockItems(currentPage);
  }, [currentPage]);

  const fetchStockItems = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:9988/stock?page=${page}&limit=${itemsPerPage}`
      );
      setStockItems(response.data.data || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load stock items",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (id, name) => {
    try {
      setSelectedStock(name);
      const response = await axios.get(
        `http://localhost:9988/stock/${id}/history`
      );
      setHistoryData(response.data);
      setIsHistoryOpen(true);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load stock history",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:9988/stock/${id}`);
      toast({
        title: "Success",
        description: response.data.message || "Item deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchStockItems(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete item",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:9988/stock_select/${id}`
      );
      const data = response.data;
      setNewItem({
        productId: data.product_id || "",
        name: data.product_name || "",
        rate: data.rate || "",
        qty: data.quantity || "",
        gst: data.gst || "",
        addQty: "",
      });
      setIsEditing(true);
      setEditingId(id);
      onOpen();
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch item",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (
        !newItem.productId ||
        !newItem.name ||
        !newItem.rate ||
        !newItem.qty
      ) {
        throw new Error("Please fill all required fields");
      }

      const itemToSend = {
        ...newItem,
        rate: parseFloat(newItem.rate),
        gst: newItem.gst ? parseFloat(newItem.gst) : 0,
        qty: parseInt(newItem.qty),
        addQty: parseInt(newItem.addQty) || 0,
      };

      if (isEditing) {
        await axios.put(`http://localhost:9988/stock/${editingId}`, itemToSend);
        toast({
          title: "Updated",
          description: "Stock updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(`http://localhost:9988/stock`, itemToSend);
        toast({
          title: "Added",
          description: "New stock item added",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      resetForm();
      fetchStockItems(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setNewItem({
      productId: "",
      name: "",
      rate: "",
      qty: "",
      gst: "",
      addQty: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <>
      {loading && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="white"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
        >
          <Spinner size="xl" color="#625DF0" thickness="4px" mb={4} />
          <Text fontSize="sm" color="gray.600" fontFamily="Inter, sans-serif">
            Retrieving records, please wait...
          </Text>
        </Box>
      )}
      <Box fontFamily="Inter, sans-serif" overflow="hidden">
        {/* Page Header */}
        <Flex
          justify="space-between"
          align="center"
          position="sticky"
          top="0"
          zIndex="1"
          py={2}
        >
          <Heading
            fontSize="lg"
            fontWeight="bold"
            color="#625DF0"
            fontFamily="Poppins, sans-serif"
          >
            Stock Details
          </Heading>

          <Button
            leftIcon={<FiPlus />}
            bg="#625DF0"
            color="white"
            _hover={{
              bg: "#5854d4",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(98, 93, 240, 0.3)",
            }}
            _active={{
              bg: "#4f4bc0",
            }}
            transition="all 0.3s ease"
            fontWeight="500"
            borderRadius="lg"
            size="sm"
            onClick={() => {
              resetForm();
              onOpen();
            }}
          >
            Add Stock
          </Button>
        </Flex>

        {/* Table Card */}
        <Card
          borderRadius="xl"
          boxShadow="0 0 20px rgba(98, 93, 240, 0.1)"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          bg="white"
          h="calc(100% - 80px)"
        >
          <Box overflowX="auto" maxH="calc(100vh - 220px)">
            <Table variant="simple" size="sm">
              <Thead bg="#eaebffff" position="sticky" top="0" zIndex="1">
                <Tr>
                  <Th
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    color="gray.700"
                    fontSize="xs"
                    py={3}
                    borderBottom="2px solid"
                    borderColor={tableBorderColor}
                  >
                    ID
                  </Th>
                  <Th
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    color="gray.700"
                    fontSize="xs"
                    borderBottom="2px solid"
                    borderColor={tableBorderColor}
                  >
                    Product Name
                  </Th>
                  <Th
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    color="gray.700"
                    fontSize="xs"
                    textAlign="right"
                    borderBottom="2px solid"
                    borderColor={tableBorderColor}
                  >
                    Rate (₹)
                  </Th>
                  <Th
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    color="gray.700"
                    fontSize="xs"
                    textAlign="right"
                    borderBottom="2px solid"
                    borderColor={tableBorderColor}
                  >
                    Total Qty
                  </Th>
                  <Th
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    color="gray.700"
                    fontSize="xs"
                    textAlign="right"
                    borderBottom="2px solid"
                    borderColor={tableBorderColor}
                  >
                    Available Qty
                  </Th>
                  <Th
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    color="gray.700"
                    fontSize="xs"
                    textAlign="center"
                    borderBottom="2px solid"
                    borderColor={tableBorderColor}
                  >
                    Action
                  </Th>
                </Tr>
              </Thead>

              <Tbody>
                {stockItems.map((item) => (
                  <Tr
                    key={item.id}
                    _hover={{
                      bg: "#f7f9ffff",
                    }}
                    transition="all 0.2s ease"
                  >
                    <Td borderBottom="1px solid" borderColor={rowBorderColor}>
                      <Tooltip
                        label={`Edit Item ID: ${item.sid}`}
                        placement="top"
                        hasArrow
                        bg="#625DF0"
                        color="white"
                      >
                        <Text
                          cursor="pointer"
                          fontFamily="Inter, sans-serif"
                          fontSize="xs"
                          color="#625DF0"
                          fontWeight="500"
                          textDecoration="underline"
                          onClick={() => handleEdit(item.sid)}
                          _hover={{
                            color: "#5854d4",
                            textDecoration: "none",
                          }}
                          transition="all 0.2s ease"
                        >
                          {item.id}
                        </Text>
                      </Tooltip>
                    </Td>

                    <Td
                      fontFamily="Inter, sans-serif"
                      fontSize="xs"
                      color="gray.700"
                      borderBottom="1px solid"
                      borderColor={rowBorderColor}
                    >
                      {item.name}
                    </Td>
                    <Td
                      textAlign="right"
                      fontFamily="Inter, sans-serif"
                      fontSize="xs"
                      color="gray.700"
                      fontWeight="500"
                      borderBottom="1px solid"
                      borderColor={rowBorderColor}
                    >
                      ₹{item.rate}
                    </Td>
                    <Td
                      textAlign="right"
                      fontFamily="Inter, sans-serif"
                      fontSize="xs"
                      color="gray.700"
                      borderBottom="1px solid"
                      borderColor={rowBorderColor}
                    >
                      {item.quantity}
                    </Td>
                    <Td
                      textAlign="right"
                      fontFamily="Inter, sans-serif"
                      fontSize="xs"
                      color="gray.700"
                      borderBottom="1px solid"
                      borderColor={rowBorderColor}
                    >
                      {item.availableQty}
                    </Td>
                    <Td
                      textAlign="center"
                      borderBottom="1px solid"
                      borderColor={rowBorderColor}
                    >
                      <Tooltip
                        label="Delete Item"
                        hasArrow
                        bg="#625DF0"
                        color="white"
                      >
                        <IconButton
                          icon={<FiTrash />}
                          aria-label="Delete"
                          size="xs"
                          variant="ghost"
                          color="red.500"
                          _hover={{
                            bg: "red.50",
                            transform: "scale(1.05)",
                          }}
                          ml={1}
                          transition="all 0.3s ease"
                          onClick={() => {
                            setDeleteItemId(item.sid);
                            onDeleteOpen();
                          }}
                        />
                      </Tooltip>
                      <Tooltip
                        label="View History"
                        hasArrow
                        bg="#625DF0"
                        color="white"
                      >
                        <IconButton
                          icon={<FiEye />}
                          aria-label="View History"
                          size="xs"
                          variant="ghost"
                          color="#625DF0"
                          _hover={{
                            bg: "#625DF0",
                            color: "white",
                            transform: "scale(1.05)",
                          }}
                          ml={2}
                          transition="all 0.3s ease"
                          onClick={() => handleViewHistory(item.sid, item.name)}
                        />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination - Right Aligned with Item Count */}
          <Flex
            justify="space-between"
            align="center"
            py={3}
            bg="white"
            borderTop="1px solid"
            borderColor={tableBorderColor}
            px={6}
          >
            {/* Left side - Items count */}
            <Box>
              <Text
                fontFamily="Inter, sans-serif"
                fontSize="xs"
                color="gray.600"
              >
                Showing {stockItems.length} items
              </Text>
            </Box>

            {/* Right side - Pagination */}
            <HStack spacing={2}>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                isDisabled={currentPage === 1}
                fontFamily="Inter, sans-serif"
                fontWeight="500"
                _hover={{
                  bg: "#625DF0",
                  color: "white",
                  borderColor: "#625DF0",
                }}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="xs"
                  variant={currentPage === i + 1 ? "solid" : "outline"}
                  bg={currentPage === i + 1 ? "#625DF0" : "transparent"}
                  color={currentPage === i + 1 ? "white" : "gray.700"}
                  borderColor={currentPage === i + 1 ? "#625DF0" : "gray.300"}
                  _hover={{
                    bg: "#625DF0",
                    color: "white",
                    borderColor: "#625DF0",
                  }}
                  fontFamily="Inter, sans-serif"
                  fontWeight="500"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                isDisabled={currentPage === totalPages}
                fontFamily="Inter, sans-serif"
                fontWeight="500"
                _hover={{
                  bg: "#625DF0",
                  color: "white",
                  borderColor: "#625DF0",
                }}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </Card>

        {/* Add/Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent
            borderRadius="xl"
            boxShadow="0 10px 40px rgba(98, 93, 240, 0.2)"
            border="1px solid"
            borderColor={borderColor}
          >
            <ModalHeader
              fontFamily="Poppins, sans-serif"
              fontWeight="600"
              color="gray.800"
              borderBottom="1px solid"
              borderColor={tableBorderColor}
            >
              {isEditing ? "Edit Stock Item" : "Add New Stock Item"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                    color="gray.700"
                    fontSize="sm"
                  >
                    Product ID
                  </FormLabel>
                  <Input
                    name="productId"
                    value={newItem.productId}
                    onChange={handleChange}
                    placeholder="Enter product ID"
                    isDisabled={isEditing}
                    fontFamily="Inter, sans-serif"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{
                      borderColor: "#625DF0",
                    }}
                    _focus={{
                      borderColor: "#625DF0",
                      boxShadow: "0 0 0 1px #625DF0",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                    color="gray.700"
                    fontSize="sm"
                  >
                    Product Name
                  </FormLabel>
                  <Input
                    name="name"
                    value={newItem.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    isDisabled={isEditing}
                    fontFamily="Inter, sans-serif"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{
                      borderColor: "#625DF0",
                    }}
                    _focus={{
                      borderColor: "#625DF0",
                      boxShadow: "0 0 0 1px #625DF0",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                    color="gray.700"
                    fontSize="sm"
                  >
                    Rate (₹)
                  </FormLabel>
                  <Input
                    type="number"
                    name="rate"
                    value={newItem.rate}
                    onChange={handleChange}
                    placeholder="Enter rate"
                    isDisabled={isEditing}
                    fontFamily="Inter, sans-serif"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{
                      borderColor: "#625DF0",
                    }}
                    _focus={{
                      borderColor: "#625DF0",
                      boxShadow: "0 0 0 1px #625DF0",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                    color="gray.700"
                    fontSize="sm"
                  >
                    Current Quantity
                  </FormLabel>
                  <Input
                    type="number"
                    name="qty"
                    value={newItem.qty}
                    onChange={handleChange}
                    placeholder="Enter total quantity"
                    isDisabled={isEditing}
                    fontFamily="Inter, sans-serif"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{
                      borderColor: "#625DF0",
                    }}
                    _focus={{
                      borderColor: "#625DF0",
                      boxShadow: "0 0 0 1px #625DF0",
                    }}
                  />
                </FormControl>
                {isEditing && (
                  <FormControl>
                    <FormLabel
                      fontFamily="Inter, sans-serif"
                      fontWeight="500"
                      color="gray.700"
                      fontSize="sm"
                    >
                      Add Quantity
                    </FormLabel>
                    <Input
                      type="number"
                      name="addQty"
                      value={newItem.addQty}
                      onChange={handleChange}
                      placeholder="Enter quantity to add"
                      fontFamily="Inter, sans-serif"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{
                        borderColor: "#625DF0",
                      }}
                      _focus={{
                        borderColor: "#625DF0",
                        boxShadow: "0 0 0 1px #625DF0",
                      }}
                    />
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                    color="gray.700"
                    fontSize="sm"
                  >
                    GST
                  </FormLabel>
                  <Input
                    type="number"
                    name="gst"
                    value={newItem.gst}
                    onChange={handleChange}
                    placeholder="Enter GST"
                    isDisabled={isEditing}
                    fontFamily="Inter, sans-serif"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{
                      borderColor: "#625DF0",
                    }}
                    _focus={{
                      borderColor: "#625DF0",
                      boxShadow: "0 0 0 1px #625DF0",
                    }}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={tableBorderColor}>
              <Button
                variant="ghost"
                mr={3}
                onClick={onClose}
                fontFamily="Inter, sans-serif"
                fontWeight="500"
                borderRadius="lg"
              >
                Cancel
              </Button>
              <Button
                bg="#625DF0"
                color="white"
                _hover={{
                  bg: "#5854d4",
                  transform: "translateY(-1px)",
                }}
                onClick={handleSave}
                fontFamily="Inter, sans-serif"
                fontWeight="500"
                borderRadius="lg"
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay />
          <ModalContent
            borderRadius="xl"
            boxShadow="0 10px 40px rgba(98, 93, 240, 0.2)"
            border="1px solid"
            borderColor={borderColor}
          >
            <ModalHeader
              fontFamily="Poppins, sans-serif"
              fontWeight="600"
              color="gray.800"
            >
              Confirm Deletion
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontFamily="Inter, sans-serif" color="gray.600">
                Are you sure you want to delete this stock item? This action
                cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onDeleteClose}
                fontFamily="Inter, sans-serif"
                fontWeight="500"
                borderRadius="lg"
              >
                Cancel
              </Button>
              <Button
                bg="red.500"
                color="white"
                _hover={{
                  bg: "red.600",
                  transform: "translateY(-1px)",
                }}
                onClick={() => {
                  handleDelete(deleteItemId);
                  onDeleteClose();
                }}
                fontFamily="Inter, sans-serif"
                fontWeight="500"
                borderRadius="lg"
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* History Modal */}
        <Modal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          size="lg"
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            borderRadius="xl"
            boxShadow="0 10px 40px rgba(98, 93, 240, 0.2)"
            border="1px solid"
            borderColor={borderColor}
          >
            <ModalHeader
              fontFamily="Poppins, sans-serif"
              fontWeight="600"
              color="gray.800"
              borderBottom="1px solid"
              borderColor={tableBorderColor}
            >
              Stock History — {selectedStock}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              {historyData.length > 0 ? (
                <Box
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  overflow="hidden"
                >
                  <Table variant="simple" size="sm">
                    <Thead bg="#eaebffff">
                      <Tr>
                        <Th
                          fontFamily="Inter, sans-serif"
                          fontWeight="600"
                          color="gray.700"
                          fontSize="xs"
                          borderBottom="2px solid"
                          borderColor={tableBorderColor}
                        >
                          Date & Time
                        </Th>
                        <Th
                          fontFamily="Inter, sans-serif"
                          fontWeight="600"
                          color="gray.700"
                          fontSize="xs"
                          isNumeric
                          borderBottom="2px solid"
                          borderColor={tableBorderColor}
                        >
                          Old Qty
                        </Th>
                        <Th
                          fontFamily="Inter, sans-serif"
                          fontWeight="600"
                          color="gray.700"
                          fontSize="xs"
                          isNumeric
                          borderBottom="2px solid"
                          borderColor={tableBorderColor}
                        >
                          Added Qty
                        </Th>
                        <Th
                          fontFamily="Inter, sans-serif"
                          fontWeight="600"
                          color="gray.700"
                          fontSize="xs"
                          isNumeric
                          borderBottom="2px solid"
                          borderColor={tableBorderColor}
                        >
                          New Qty
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {historyData.map((record, index) => (
                        <Tr key={index}>
                          <Td
                            fontFamily="Inter, sans-serif"
                            fontSize="xs"
                            color="gray.600"
                            borderBottom="1px solid"
                            borderColor={rowBorderColor}
                          >
                            {new Date(record.updated_at).toLocaleString()}
                          </Td>
                          <Td
                            fontFamily="Inter, sans-serif"
                            fontSize="xs"
                            color="gray.600"
                            isNumeric
                            borderBottom="1px solid"
                            borderColor={rowBorderColor}
                          >
                            {record.old_qty}
                          </Td>
                          <Td
                            fontFamily="Inter, sans-serif"
                            fontSize="xs"
                            color="#625DF0"
                            fontWeight="600"
                            isNumeric
                            borderBottom="1px solid"
                            borderColor={rowBorderColor}
                          >
                            +{record.added_qty}
                          </Td>
                          <Td
                            fontFamily="Inter, sans-serif"
                            fontSize="xs"
                            color="gray.600"
                            isNumeric
                            borderBottom="1px solid"
                            borderColor={rowBorderColor}
                          >
                            {record.new_qty}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Text
                  textAlign="center"
                  py={8}
                  color="gray.500"
                  fontFamily="Inter, sans-serif"
                >
                  No history found for this stock item.
                </Text>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={tableBorderColor}>
              <Button
                bg="#625DF0"
                color="white"
                _hover={{
                  bg: "#5854d4",
                  transform: "translateY(-1px)",
                }}
                onClick={() => setIsHistoryOpen(false)}
                fontFamily="Inter, sans-serif"
                fontWeight="500"
                borderRadius="lg"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default Stock;
