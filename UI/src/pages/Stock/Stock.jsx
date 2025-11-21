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
import { showToast } from "../../utils/toast";
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
    purchase_rate: "",
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
        `${
          import.meta.env.VITE_API_BASE_URL
        }/stock?page=${page}&limit=${itemsPerPage}`
      );
      setStockItems(response.data.data || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to load stock items",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (id, name) => {
    try {
      setSelectedStock(name);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/stock/${id}/history`
      );
      setHistoryData(response.data);
      setIsHistoryOpen(true);
    } catch {
      showToast({
        title: "Error",
        description: "Failed to load stock history",
        status: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/stock/${id}`
      );
      showToast({
        title: "Success",
        description: response.data.message || "Item deleted successfully",
        status: "success",
      });
      fetchStockItems(currentPage);
    } catch (error) {
      showToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete item",
        status: "error",
      });
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/stock_select/${id}`
      );
      const data = response.data;
      setNewItem({
        productId: data.product_id || "",
        name: data.product_name || "",
        purchase_rate: data.purchase_rate || "",
        rate: data.rate || "",
        qty: data.quantity || "",
        gst: data.gst || "",
        addQty: "",
      });
      setIsEditing(true);
      setEditingId(id);
      onOpen();
    } catch {
      showToast({
        title: "Error",
        description: "Failed to fetch item",
        status: "error",
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
        !newItem.qty ||
        !newItem.purchase_rate
      ) {
        throw new Error("Please fill all required fields");
      }

      const itemToSend = {
        ...newItem,
        purchase_rate: parseFloat(newItem.purchase_rate),
        rate: parseFloat(newItem.rate),
        gst: newItem.gst ? parseFloat(newItem.gst) : 0,
        qty: parseInt(newItem.qty),
        addQty: parseInt(newItem.addQty) || 0,
      };

      if (isEditing) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/stock/${editingId}`,
          itemToSend
        );
        showToast({
          title: "Updated",
          description: "Stock updated successfully",
          status: "success",
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/stock`,
          itemToSend
        );
        showToast({
          title: "Added",
          description: "New stock item added",
          status: "success",
        });
      }

      onClose();
      resetForm();
      fetchStockItems(currentPage);
    } catch (error) {
      showToast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
      });
    }
  };

  const resetForm = () => {
    setNewItem({
      productId: "",
      name: "",
      purchase_rate: "",
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
        <Box className="loading-overlay">
          <Spinner size="xl" color="#625DF0" thickness="4px" mb={2} />
          <Text className="loading-text">
            Retrieving records, please wait...
          </Text>
        </Box>
      )}

      <Box overflow="hidden">
        {/* Page Header */}
        <Flex className="page-header">
          <Text className="page-title">Stock Details</Text>
          <Button
            className="btn-primary"
            size="sm"
            onClick={() => {
              resetForm();
              onOpen();
            }}
            leftIcon={<FiPlus />}
          >
            Add Stock
          </Button>
        </Flex>

        <Card className="table-card">
          <Box className="table-scroll">
            <Table className="table" variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Product Name</Th>
                  <Th className="text-right">Purchase Rate (₹)</Th>
                  <Th className="text-right">Rate (₹)</Th>
                  <Th className="text-right">Total Qty</Th>
                  <Th className="text-right">Available Qty</Th>
                  <Th textAlign="center">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stockItems.map((item) => (
                  <Tr key={item.sid}>
                    <Td
                      className="clickable-id"
                      onClick={() => handleEdit(item.sid)}
                    >
                      {item.id}
                    </Td>
                    <Td>{item.name}</Td>
                    <Td className="text-right">₹{item.purchase_rate}</Td>
                    <Td className="text-right">₹{item.rate}</Td>
                    <Td className="text-right">{item.quantity}</Td>
                    <Td className="text-right">{item.availableQty}</Td>

                    <Td>
                      <Flex justify="left" align="left" gap="6px">
                        <Tooltip label="Delete Item" bg="#625DF0" color="white">
                          <IconButton
                            icon={<FiTrash />}
                            aria-label="Delete"
                            size="xs"
                            className="table-action-btn delete"
                            onClick={() => {
                              setDeleteItemId(item.sid);
                              onDeleteOpen();
                            }}
                          />
                        </Tooltip>
                        <Tooltip
                          label="View History"
                          bg="#625DF0"
                          color="white"
                        >
                          <IconButton
                            icon={<FiEye />}
                            aria-label="View History"
                            size="xs"
                            className="table-action-btn view"
                            onClick={() =>
                              handleViewHistory(item.sid, item.name)
                            }
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          <Flex className="pagination-footer">
            <Text className="pagination-text">
              Showing {stockItems.length} items
            </Text>
            <HStack spacing={2}>
              <Button
                size="xs"
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                isDisabled={currentPage === 1}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="xs"
                  className={`pagination-btn ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                size="xs"
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                isDisabled={currentPage === totalPages}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </Card>

        {/* Add / Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent className="modal-box">
            <ModalHeader className="modal-header">
              {isEditing ? "Edit Stock Item" : "Add New Stock Item"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody className="modal-body">
              <Stack spacing={3} className="modal-form">
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
                    Purchase Rate (₹)
                  </FormLabel>
                  <Input
                    type="number"
                    name="purchase_rate"
                    value={newItem.purchase_rate}
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
            <ModalFooter className="modal-footer">
              <Button
                variant="ghost"
                className="btn-cancel"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button className="btn-primary" size="sm" onClick={handleSave}>
                {isEditing ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay />
          <ModalContent className="modal-box">
            <ModalHeader className="modal-header">Confirm Deletion</ModalHeader>
            <ModalCloseButton />
            <ModalBody className="modal-body">
              <Text>Are you sure you want to delete this stock item?</Text>
            </ModalBody>
            <ModalFooter className="modal-footer">
              <Button
                variant="ghost"
                className="btn-cancel"
                onClick={onDeleteClose}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                className="btn-danger"
                size="sm"
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

        {/* History Modal */}
        <Modal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          size="lg"
          isCentered
        >
          <ModalOverlay />
          <ModalContent className="modal-box">
            <ModalHeader className="modal-header">
              Stock History - {selectedStock}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody className="modal-body">
              {historyData.length > 0 ? (
                <Box className="table-card">
                  <Box className="table-scroll">
                    <Table className="table">
                      <Thead>
                        <Tr>
                          <Th>Date & Time</Th>
                          <Th className="text-right">Old Qty</Th>
                          <Th className="text-right">Added Qty</Th>
                          <Th className="text-right">New Qty</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {historyData.map((record, index) => (
                          <Tr key={index}>
                            <Td>
                              {new Date(record.updated_at).toLocaleString()}
                            </Td>
                            <Td className="text-right">{record.old_qty}</Td>
                            <Td className="text-right added">
                              +{record.added_qty}
                            </Td>
                            <Td className="text-right">{record.new_qty}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              ) : (
                <Text className="empty-text">
                  No history found for this stock item.
                </Text>
              )}
            </ModalBody>
            <ModalFooter className="modal-footer">
              <Button
                className="btn-primary"
                size="sm"
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
