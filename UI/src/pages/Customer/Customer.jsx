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
  Select,
} from "@chakra-ui/react";
import { FiTrash2, FiPlus, FiEye, FiTrash } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";
const Customer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [stockItems, setStockItems] = useState([]);
  const toast = useToast();
  const [deleteItemId, setDeleteItemId] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const modalSize = useBreakpointValue({ base: "full", md: "lg" });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [newItem, setNewItem] = useState({
    customer_name: "",
    mobile: "",
    aadhar: "",
    address: "",
    guarantor_name: "",
    guarantor_aadhar: "",
    document: null,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStockItems(currentPage);
  }, [currentPage]);

  const validateCustomer = () => {
    let newErrors = {};

    if (!newItem.customer_name?.trim()) newErrors.customer_name = "Enter customer name";

    if (!newItem.mobile?.trim()) newErrors.mobile = "Enter valid mobile";
    else if (newItem.mobile.length !== 10) newErrors.mobile = "Mobile must be 10 digits";

    if (!newItem.aadhar?.trim()) newErrors.aadhar = "Enter Aadhar number";
    else if (newItem.aadhar.length !== 12) newErrors.aadhar = "Aadhar must be 12 digits";

    if (!newItem.address?.trim()) newErrors.address = "Enter address";

    if (!newItem.guarantor_name?.trim()) newErrors.guarantor_name = "Enter guarantor name";

    if (!newItem.guarantor_aadhar?.trim()) newErrors.guarantor_aadhar = "Enter guarantor Aadhar";
    else if (newItem.guarantor_aadhar.length !== 12) newErrors.guarantor_aadhar = "Guarantor Aadhar must be 12 digits";

    if (!selectedFile) newErrors.document = "Upload customer document";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const fetchStockItems = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/stock?page=${page}&limit=${itemsPerPage}`);
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

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/stock/${id}`);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on typing
  };

  const handleSave = async () => {
    if (!validateCustomer()) {
      showToast({
        title: "Validation Error",
        description: "Please fill all required fields",
        status: "error",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("customer_name", newItem.customer_name);
      formData.append("mobile", newItem.mobile);
      formData.append("aadhar", newItem.aadhar);
      formData.append("address", newItem.address);
      formData.append("guarantor_name", newItem.guarantor_name);
      formData.append("guarantor_aadhar", newItem.guarantor_aadhar);
      formData.append("document", selectedFile);

      let response;

      if (isEditing) {
        response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/customer/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/customer`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      showToast({
        title: isEditing ? "Updated" : "Added",
        description: response.data.message || "Customer saved successfully",
        status: "success",
      });

      onClose();
      resetForm();
      fetchStockItems(currentPage);
    } catch (err) {
      showToast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save customer",
        status: "error",
      });
    }
  };

  const resetForm = () => {
    setNewItem({
      productId: "",
      name: "",
      purchase_rate: "",
      supplier_name: "",
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
          <Text className="loading-text">Retrieving records, please wait...</Text>
        </Box>
      )}

      <Box overflow="hidden">
        {/* Page Header */}
        <Flex className="page-header">
          <Text className="page-title">Customer</Text>
          <Button
            className="btn-primary"
            size="sm"
            onClick={() => {
              resetForm();
              onOpen();
            }}
            leftIcon={<FiPlus />}
          >
            Add Customer
          </Button>
        </Flex>

        <Card className="table-card">
          <Box className="table-scroll">
            <Table className="table" variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Customer Name</Th>
                  <Th>Mobile</Th>
                  <Th>Address (₹)</Th>
                  <Th>Aadhar No</Th>
                  <Th>Guarantor</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stockItems.map((item) => (
                  <Tr key={item.sid}>
                    <Td
                      className="clickable-id"
                      onClick={() => handleEdit(item.sid)}
                      sx={{
                        cursor: "pointer !important",
                        color: "#625DF0 !important",
                        // textDecoration: "underline !important",
                      }}
                    >
                      {item.id}
                    </Td>
                    <Td>{item.name}</Td>
                    <Td>₹{item.purchase_rate}</Td>
                    <Td>₹{item.rate}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>{item.availableQty}</Td>

                    <Td>
                      <Flex>
                        <Tooltip label="Delete Item" bg="#625DF0" color="white">
                          <IconButton
                            icon={<FiTrash />}
                            aria-label="Delete"
                            size="sm"
                            className="table-action-btn delete"
                            onClick={() => {
                              setDeleteItemId(item.sid);
                              onDeleteOpen();
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="View History" bg="#625DF0" color="white">
                          <IconButton
                            icon={<FiEye />}
                            aria-label="View History"
                            size="sm"
                            className="table-action-btn view"
                            onClick={() => handleViewHistory(item.sid, item.name)}
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
            <Text className="pagination-text">Showing {stockItems.length} items</Text>
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
                  className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                size="xs"
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
            <ModalHeader className="modal-header">{isEditing ? "Edit Customer" : "Add New Customer"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody className="modal-body">
              <Stack spacing={3} className="modal-form">
                <FormControl isInvalid={errors.customer_name}>
                  <FormLabel fontFamily="Inter, sans-serif" fontWeight="500">
                    Customer Name
                  </FormLabel>
                  <Input
                    name="customer_name"
                    value={newItem.customer_name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
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
                  {errors.customer_name && (
                    <Text color="red.500" fontSize="sm">
                      {errors.customer_name}
                    </Text>
                  )}
                </FormControl>
                <FormControl isInvalid={errors.mobile}>
                  <FormLabel fontFamily="Inter, sans-serif" fontWeight="500">
                    Mobile
                  </FormLabel>
                  <Input
                    name="mobile"
                    value={newItem.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
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
                  {errors.mobile && (
                    <Text color="red.500" fontSize="sm">
                      {errors.mobile}
                    </Text>
                  )}
                </FormControl>
                <FormControl isInvalid={errors.aadhar}>
                  <FormLabel fontFamily="Inter, sans-serif" fontWeight="500">
                    Aadhar No
                  </FormLabel>
                  <Input
                    type="number"
                    name="aadhar"
                    value={newItem.aadhar}
                    onChange={handleChange}
                    placeholder="Enter aadhar number"
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
                  {errors.aadhar && (
                    <Text color="red.500" fontSize="sm">
                      {errors.aadhar}
                    </Text>
                  )}
                </FormControl>
                <FormControl isInvalid={errors.address}>
                  <FormLabel fontFamily="Inter, sans-serif" fontWeight="500">
                    Address
                  </FormLabel>
                  <Input
                    name="address"
                    value={newItem.address}
                    onChange={handleChange}
                    placeholder="Enter address"
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
                  {errors.address && (
                    <Text color="red.500" fontSize="sm">
                      {errors.address}
                    </Text>
                  )}
                </FormControl>
                <FormControl isInvalid={errors.guarantor_name}>
                  <FormLabel fontFamily="Inter, sans-serif" fontWeight="500">
                    Guarentor name
                  </FormLabel>
                  <Input
                    name="guarantor_name"
                    value={newItem.guarantor_name}
                    onChange={handleChange}
                    placeholder="Enter guarantor name"
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
                  {errors.guarantor_name && (
                    <Text color="red.500" fontSize="sm">
                      {errors.guarantor_name}
                    </Text>
                  )}
                </FormControl>
                <FormControl isInvalid={errors.guarantor_aadhar}>
                  <FormLabel fontFamily="Inter, sans-serif" fontWeight="500">
                    Guarantor Aadhar
                  </FormLabel>
                  <Input
                    type="number"
                    name="guarantor_aadhar"
                    value={newItem.guarantor_aadhar}
                    onChange={handleChange}
                    placeholder="Enter guarantor aadhar"
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
                  {errors.guarantor_aadhar && (
                    <Text color="red.500" fontSize="sm">
                      {errors.guarantor_aadhar}
                    </Text>
                  )}
                </FormControl>
                <FormControl isInvalid={errors.document}>
                  <FormLabel fontFamily="Inter, sans-serif" fontWeight="500">
                    Upload Document
                  </FormLabel>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{ borderColor: "#625DF0" }}
                    _focus={{ borderColor: "#625DF0", boxShadow: "0 0 0 1px #625DF0" }}
                  />
                  {errors.document && (
                    <Text color="red.500" fontSize="sm">
                      {errors.document}
                    </Text>
                  )}
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter className="modal-footer">
              <Button variant="ghost" className="btn-cancel" size="sm" onClick={onClose}>
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
              <Button variant="ghost" className="btn-cancel" onClick={onDeleteClose} size="sm">
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
      </Box>
    </>
  );
};

export default Customer;
