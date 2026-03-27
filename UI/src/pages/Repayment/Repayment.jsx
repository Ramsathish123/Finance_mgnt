import {
  Box,
  Button,
  Flex,
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
  FormErrorMessage,
  Stack,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Tooltip,
  Spinner,
  Text,
  HStack,
  Select,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiPrinter } from "react-icons/fi";
import { useState, useEffect } from "react";
import { showToast } from "../../utils/toast"; // optional, you can use toast directly

const Repayment = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [formData, setFormData] = useState({
    loanNo: "",
    customerName: "",
    mobileNumber: "",
    address: "",
    due_amount: "",
    pay_amount: "",
    pending_amount: 0,
    due_date: "",
  });

  const [errors, setErrors] = useState({});
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [serviceCount, setServiceCount] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchdate, setSearchDate] = useState();
  const [loading, setLoading] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Responsive modal size
  const modalSize = useBreakpointValue({ base: "full", md: "xl" });

  useEffect(() => {
    fetchServiceCount();
    fetchServices();
  }, []);

  useEffect(() => {
    // Recalculate pending whenever due_amount or pay_amount changes
    const due = parseFloat(formData.due_amount) || 0;
    const pay = parseFloat(formData.pay_amount) || 0;
    const pending = Math.max(0, parseFloat((due - pay).toFixed(2)));
    setFormData((prev) => ({ ...prev, pending_amount: pending }));
  }, [formData.due_amount, formData.pay_amount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // allow only numbers for amount fields (but let user type decimals)
    if ((name === "due_amount" || name === "pay_amount") && value !== "") {
      // replace invalid chars except digits and dot
      const cleaned = value.replace(/[^\d.]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else if (name === "mobileNumber") {
      // allow only digits (max 10)
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // clear the field error while typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.loanNo?.toString().trim()) newErrors.loanNo = "Enter loan number";
    if (!formData.customerName?.trim()) newErrors.customerName = "Enter customer name";
    if (!formData.mobileNumber?.trim()) newErrors.mobileNumber = "Enter mobile number";
    else if (formData.mobileNumber.length !== 10) newErrors.mobileNumber = "Mobile must be 10 digits";
    if (!formData.address?.trim()) newErrors.address = "Enter address";

    const due = parseFloat(formData.due_amount);
    if (isNaN(due) || due <= 0) newErrors.due_amount = "Enter due amount greater than 0";

    const pay = parseFloat(formData.pay_amount);
    if (isNaN(pay) || pay < 0) newErrors.pay_amount = "Enter valid payment amount";
    if (!isNaN(due) && !isNaN(pay) && pay > due) newErrors.pay_amount = "Payment cannot exceed due amount";

    if (!formData.due_date) newErrors.due_date = "Select due date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    try {
      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Please fix the highlighted fields.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Prepare payload for API
      const payload = {
        loan_no: formData.loanNo,
        cus_name: formData.customerName,
        mobile: formData.mobileNumber,
        address: formData.address,
        due_amount: parseFloat(formData.due_amount),
        pay_amount: parseFloat(formData.pay_amount) || 0,
        pending_amount: parseFloat(formData.pending_amount),
        due_date: formData.due_date,
      };

      setLoading(true);

      // Example API call - adjust endpoint as necessary
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/repayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Payment Saved",
          description: data.message || "Repayment recorded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // reset form
        setFormData({
          loanNo: "",
          customerName: "",
          mobileNumber: "",
          address: "",
          due_amount: "",
          pay_amount: "",
          pending_amount: 0,
          due_date: "",
        });

        // Refresh list
        fetchServices(currentPage);
        fetchServiceCount();
      } else {
        toast({
          title: "Save Failed",
          description: data.message || "Failed to save repayment.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Pay error:", err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (page = 1, date = "") => {
    setLoading(true);
    try {
      const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/get_service`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", itemsPerPage);
      if (date) url.searchParams.append("date", date);

      const response = await fetch(url.toString());
      const json = await response.json();
      if (response.ok) {
        const formatted = json.data.map((item, index) => ({
          id: item.service_id || index + 1,
          service_id: item.service_id,
          serviceNo: item.service_no,
          customerName: item.cus_name,
          mobileModel: item.mob_model,
          mobileNumber: item.mob_no,
          issue: item.issue_details,
          status: item.status,
          date: item.received_date ? new Date(item.received_date).toLocaleDateString("en-IN") : "N/A",
        }));
        setServices(formatted);
        setCurrentPage(json.currentPage);
        setTotalPages(json.totalPages);
      } else {
        console.error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Fetch services error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage]);

  const fetchServiceCount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_service_count`);
      const data = await response.json();
      if (response.ok) {
        setServiceCount(data);
      } else {
        console.error("Failed to fetch service count");
      }
    } catch (error) {
      console.error("Fetch service count error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handy small helper to fill form from selected table row (optional)
  const handleEdit = (serviceId) => {
    const svc = services.find((s) => s.service_id === serviceId);
    if (!svc) return;
    setFormData((prev) => ({
      ...prev,
      loanNo: svc.serviceNo,
      customerName: svc.customerName,
      mobileNumber: svc.mobileNumber,
      address: svc.issue || prev.address,
      due_amount: prev.due_amount || "",
      due_date: prev.due_date || "",
    }));
    onOpen();
  };

  return (
    <Box overflow="hidden">
      {/* Page Header */}
      <Flex className="page-header" align="center" justify="space-between" mb={4}>
        <Text className="page-title" fontSize={{ base: "lg", md: "xl" }} fontWeight="600">
          Repayment
        </Text>
      </Flex>

      {/* Repayment Input Box */}
      <Card bg="white" borderRadius="lg" p={4} mb={6} boxShadow="sm">
        <CardBody>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            <FormControl isInvalid={!!errors.loanNo}>
              <FormLabel>Loan No</FormLabel>
              <Input
                name="loanNo"
                placeholder="Enter loan no"
                value={formData.loanNo}
                onChange={handleInputChange}
                size="sm"
              />
              {errors.loanNo && <FormErrorMessage>{errors.loanNo}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.mobileNumber}>
              <FormLabel>Mobile</FormLabel>
              <Input
                name="mobileNumber"
                placeholder="Enter mobile no"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                size="sm"
                inputMode="numeric"
              />
              {errors.mobileNumber && <FormErrorMessage>{errors.mobileNumber}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.address}>
              <FormLabel>Area / Address</FormLabel>
              <Select
                name="address"
                placeholder="Select area"
                value={formData.address}
                onChange={handleInputChange}
                size="sm"
              >
                <option value="Thanjavur">Thanjavur</option>
                <option value="Trichy">Trichy</option>
                <option value="Ariyalur">Ariyalur</option>
              </Select>
              {errors.address && <FormErrorMessage>{errors.address}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.customerName}>
              <FormLabel>Customer Name</FormLabel>
              <Input
                name="customerName"
                placeholder="Enter customer"
                value={formData.customerName}
                onChange={handleInputChange}
                size="sm"
              />
              {errors.customerName && <FormErrorMessage>{errors.customerName}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.due_amount}>
              <FormLabel>Due Amount</FormLabel>
              <Input
                name="due_amount"
                placeholder="Due amount"
                value={formData.due_amount}
                onChange={handleInputChange}
                size="sm"
                inputMode="decimal"
              />
              {errors.due_amount && <FormErrorMessage>{errors.due_amount}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.due_date}>
              <FormLabel>Due Date</FormLabel>
              <Input name="due_date" type="date" value={formData.due_date} onChange={handleInputChange} size="sm" />
              {errors.due_date && <FormErrorMessage>{errors.due_date}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.pay_amount}>
              <FormLabel>Pay Amount</FormLabel>
              <Input
                name="pay_amount"
                placeholder="Enter payment"
                value={formData.pay_amount}
                onChange={handleInputChange}
                size="sm"
                inputMode="decimal"
              />
              {errors.pay_amount && <FormErrorMessage>{errors.pay_amount}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Balance / Pending</FormLabel>
              <Input name="pending_amount" value={formData.pending_amount} readOnly size="sm" bg="gray.50" />
            </FormControl>
          </SimpleGrid>

          {/* Buttons */}
          <Flex mt={4} justify="flex-end" gap={3}>
            <Button
              variant="outline"
              colorScheme="gray"
              size="sm"
              onClick={() => {
                setFormData({
                  loanNo: "",
                  customerName: "",
                  mobileNumber: "",
                  address: "",
                  due_amount: "",
                  pay_amount: "",
                  pending_amount: 0,
                  due_date: "",
                });
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button colorScheme="purple" size="sm" onClick={handlePay} isLoading={loading}>
              Pay
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {/* Services / Repayment History */}
      <Card className="table-card">
        <CardHeader display="flex" justifyContent="space-between" alignItems="center" px={4} py={3}>
          <Text color={"black"} fontWeight={"500"}>
            Repayment History
          </Text>

          <Input
            type="date"
            size="sm"
            width={{ base: "100%", md: "200px" }}
            onChange={(e) => {
              const selected = e.target.value;
              setSearchDate(selected);
              setCurrentPage(1);
              fetchServices(1, selected);
            }}
          />
        </CardHeader>

        <CardBody px={0}>
          {loading ? (
            <Flex justify="center" align="center" minH="200px">
              <Spinner size="xl" color="#625DF0" thickness="4px" />
            </Flex>
          ) : (
            <>
              <Box className="table-scroll">
                {isMobile ? (
                  // ------------------ MOBILE CARD VIEW ------------------
                  <Stack spacing={4} px={3}>
                    {services.map((service) => (
                      <Box key={service.id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                        <Text fontWeight="bold" fontSize="md">
                          Loan No: {service.serviceNo}
                        </Text>

                        <Text fontSize="sm" mt={1}>
                          <b>Customer:</b> {service.customerName}
                        </Text>
                        <Text fontSize="sm">
                          <b>Mobile:</b> {service.mobileNumber}
                        </Text>
                        <Text fontSize="sm">
                          <b>Area:</b> {service.mobileModel}
                        </Text>
                        <Text fontSize="sm">
                          <b>Due Amount:</b> {service.issue}
                        </Text>
                        <Text fontSize="sm">
                          <b>Status:</b> {service.status}
                        </Text>
                        <Text fontSize="sm">
                          <b>Date:</b> {service.date}
                        </Text>

                        {/* ACTION BUTTONS */}
                        <Flex mt={3} justify="flex-end">
                          <Tooltip label="Print" bg="#625DF0" color="white">
                            <IconButton
                              icon={<FiPrinter />}
                              aria-label="Print"
                              size="sm"
                              colorScheme="purple"
                              onClick={() => handlePrint(service.service_id)}
                            />
                          </Tooltip>
                        </Flex>
                      </Box>
                    ))}

                    {services.length === 0 && (
                      <Text textAlign="center" color="gray.500">
                        No records found
                      </Text>
                    )}
                  </Stack>
                ) : (
                  // ------------------ DESKTOP TABLE VIEW ------------------
                  <Table className="table" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Loan no</Th>
                        <Th>Customer</Th>
                        <Th>Mobile</Th>
                        <Th>Area</Th>
                        <Th>Due Amount</Th>
                        <Th>Paid Amount</Th>
                        <Th>Pending Amount</Th>
                        <Th>Date</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {services.map((service) => (
                        <Tr key={service.id}>
                          <Td>{service.serviceNo}</Td>
                          <Td>{service.customerName}</Td>
                          <Td>{service.mobileNumber}</Td>
                          <Td>{service.mobileModel}</Td>
                          <Td>{service.issue}</Td>
                          <Td>{service.status}</Td>
                          <Td>{service.date}</Td>
                          <Td>
                            <Tooltip label="Print" bg="#625DF0" color="white">
                              <IconButton
                                icon={<FiPrinter />}
                                aria-label="Print"
                                size="sm"
                                className="table-action-btn view"
                                onClick={() => handlePrint(service.service_id)}
                              />
                            </Tooltip>
                          </Td>
                          <Td>
                            <Tooltip label="Print" bg="#625DF0" color="white">
                              <IconButton
                                icon={<FiPrinter />}
                                aria-label="Print"
                                size="sm"
                                colorScheme="purple"
                                onClick={() => handlePrint(service.service_id)}
                              />
                            </Tooltip>
                          </Td>
                        </Tr>
                      ))}

                      {services.length === 0 && (
                        <Tr>
                          <Td colSpan="9" textAlign="center" color="#666">
                            No recent services found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                )}
              </Box>

              {/* Pagination Footer */}
              <Flex className="pagination-footer" px={4} py={3} align="center" justify="space-between">
                <Text className="pagination-text">Showing {services.length} items</Text>

                <HStack spacing={2}>
                  <Button
                    size="xs"
                    className="pagination-btn"
                    onClick={() => {
                      const newPage = Math.max(currentPage - 1, 1);
                      setCurrentPage(newPage);
                      fetchServices(newPage, searchdate);
                    }}
                    isDisabled={currentPage === 1}
                  >
                    Prev
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      size="xs"
                      className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        fetchServices(i + 1, searchdate);
                      }}
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    size="xs"
                    className="pagination-btn"
                    onClick={() => {
                      const newPage = Math.min(currentPage + 1, totalPages);
                      setCurrentPage(newPage);
                      fetchServices(newPage, searchdate);
                    }}
                    isDisabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default Repayment;
