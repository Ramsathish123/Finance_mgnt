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
  CardBody,
  useToast,
  Tooltip,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiInfo } from "react-icons/fi";
import { FiEye, FiTrash } from "react-icons/fi";
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
  const tableBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.600");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
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

  const [loading, setLoading] = useState(false); // <-- Spinner state

  useEffect(() => {
    fetchStockItems(currentPage);
  }, [currentPage]);

  const fetchStockItems = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:9988/stock?page=${page}&limit=10`
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
    } catch (error) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch item",
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
        duration: 9988,
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
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="white"
          zIndex={9999}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" color="blue.500" thickness="4px" mb={6} />
          <Text fontSize="xl" color="black.600" fontWeight="normal">
            Retrieving records, this may take a moment…{" "}
          </Text>
        </Box>
      )}
      <Box
        p={{ base: 4, md: 8 }}
        minH="100vh"
        bg={useColorModeValue("gray.50", "gray.900")}
      >
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
          <Heading
            fontSize={{ base: "2xl", md: "2xl" }}
            fontWeight="semibold"
            color="blue.600"
            fontFamily="Orbitron, Segoe UI, sans-serif"
          >
            Stock Details
          </Heading>
          <Button
            colorScheme="blue"
            variant="solid"
            onClick={() => {
              resetForm();
              onOpen();
            }}
            leftIcon={<FiPlus />}
          >
            Add Stock
          </Button>
        </Flex>

        <Card className="table-container" borderRadius="lg" boxShadow="md">
          <Box className="table-wrapper">
            <Table className="table" variant="unstyled" size="md">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Product Name</Th>
                  <Th className="text-right">Rate (₹)</Th>
                  <Th className="text-right">Total Qty</Th>
                  <Th className="text-right">Available Qty</Th>
                  <Th className="text-center">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stockItems.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <Tooltip
                        label={`Edit Item ID: ${item.sid}`}
                        placement="top"
                        hasArrow
                      >
                        <span
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => handleEdit(item.sid)}
                        >
                          {item.id}
                        </span>
                      </Tooltip>
                    </Td>

                    <Td>{item.name}</Td>
                    <Td className="text-right">₹{item.rate}</Td>
                    <Td className="text-right">{item.quantity}</Td>
                    <Td className="text-right">{item.availableQty}</Td>

                    <Td className="text-center">
                      <Tooltip label="Delete Item" placement="top" hasArrow>
                        <IconButton
                          icon={<FiTrash />}
                          aria-label="Delete"
                          size="md"
                          variant="ghost"
                          color="#ef4444"
                          _hover={{ bg: "red.50" }}
                          ml={1}
                          onClick={() => {
                            setDeleteItemId(item.sid);
                            onDeleteOpen();
                          }}
                        />
                      </Tooltip>

                      <Tooltip label="View History" placement="top" hasArrow>
                        <IconButton
                          icon={<FiEye />}
                          aria-label="View History"
                          size="md"
                          variant="ghost"
                          color="#2563eb"
                          _hover={{ bg: "blue.50" }}
                          ml={1}
                          onClick={() => handleViewHistory(item.sid, item.name)}
                        />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination below */}
          <Flex
            className="table-pagination"
            justify="center"
            py={4}
            gap={2}
            bg="white"
          >
            <Button
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              isDisabled={currentPage === 1}
            >
              Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Flex>
        </Card>

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="xl">
            <ModalHeader>
              {isEditing ? "Edit Stock Item" : "Add New Stock Item"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Product ID</FormLabel>
                  <Input
                    name="productId"
                    value={newItem.productId}
                    onChange={handleChange}
                    placeholder="Enter product ID"
                    isDisabled={isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Product Name</FormLabel>
                  <Input
                    name="name"
                    value={newItem.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    isDisabled={isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Rate (₹)</FormLabel>
                  <Input
                    type="number"
                    name="rate"
                    value={newItem.rate}
                    onChange={handleChange}
                    placeholder="Enter rate"
                    isDisabled={isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Current Quantity</FormLabel>
                  <Input
                    type="number"
                    name="qty"
                    value={newItem.qty}
                    onChange={handleChange}
                    placeholder="Enter total quantity"
                    isDisabled={isEditing}
                  />
                </FormControl>
                {isEditing && (
                  <FormControl>
                    <FormLabel>Add Quantity</FormLabel>
                    <Input
                      type="number"
                      name="addQty"
                      value={newItem.addQty}
                      onChange={handleChange}
                      placeholder="Enter quantity to add"
                    />
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel>GST</FormLabel>
                  <Input
                    type="number"
                    name="gst"
                    value={newItem.gst}
                    onChange={handleChange}
                    placeholder="Enter GST"
                    isDisabled={isEditing}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSave}>
                {isEditing ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent borderRadius="xl" mt="10">
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete this stock item? This action
              cannot be undone.
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  handleDelete(deleteItemId);
                  onDeleteClose();
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          size="lg"
          isCentered
        >
          <ModalOverlay />
          <ModalContent borderRadius="xl">
            <ModalHeader>Stock History — {selectedStock}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {historyData.length > 0 ? (
                <Table variant="simple" size="sm">
                  <Thead bg={useColorModeValue("gray.100", "gray.700")}>
                    <Tr>
                      <Th>Date & Time</Th>
                      <Th isNumeric>Old Qty</Th>
                      <Th isNumeric>Added Qty</Th>
                      <Th isNumeric>New Qty</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {historyData.map((record, index) => (
                      <Tr key={index}>
                        <Td>{new Date(record.updated_at).toLocaleString()}</Td>
                        <Td isNumeric>{record.old_qty}</Td>
                        <Td isNumeric color="blue.600" fontWeight="semibold">
                          +{record.added_qty}
                        </Td>
                        <Td isNumeric>{record.new_qty}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text textAlign="center" py={4} color="gray.500">
                  No history found for this stock item.
                </Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                onClick={() => setIsHistoryOpen(false)}
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
