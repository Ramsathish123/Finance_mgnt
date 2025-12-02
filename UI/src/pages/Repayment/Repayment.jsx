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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Stack,
  useBreakpointValue,
  Card,
  CardHeader,
  CardBody,
  Badge,
  HStack,
  Tooltip,
  Avatar,
  Text,
  Tag,
  TagLabel,
  Select,
  useColorModeValue,
  IconButton,
  SimpleGrid,
  useToast,
  Textarea,
  Spinner, // <-- Added Spinner import
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiPlus, FiPhone, FiUser, FiSmartphone, FiAlertCircle, FiPrinter } from "react-icons/fi";
import axios from "axios";
import { showToast } from "../../utils/toast";
const Repayment = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [formData, setFormData] = useState({
    serviceNo: "",
    customerName: "",
    mobileNumber: "",
    mobileModel: "",
    issue: "",
    status: "Received",
    advance: "" || 0.0,
  });
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [serviceCount, setServiceCount] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchdate, setSearchDate] = useState();
  const [formState, setFormState] = useState({
    service_id: "",
    issueDetails: "",
    status: "",
    actualCost: "",
    advanceCost: "",
    balCost: "",
  });
  const [loading, setLoading] = useState(false); // <-- Added loading state
  const { isOpen: isAddServiceOpen, onOpen: onAddserviceOpen, onClose: onAddServiceClose } = useDisclosure();
  const { isOpen: isServicePrintOpen, onOpen: onServicePrintOpen, onClose: onServicePrintClose } = useDisclosure();
  const handleCostChange = () => {
    const advance = parseFloat(formState.advanceCost) || 0;
    const balance = parseFloat(formState.balCost) || 0;
    const total = advance + balance;

    setFormState((prev) => ({
      ...prev,
      actualCost: total,
    }));
  };

  const modalSize = useBreakpointValue({ base: "full", md: "lg" });
  const cardBg = useColorModeValue("white", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.600");

  const handlePrintClick = (service) => {
    setSelectedService(service);
    onServicePrintOpen();
  };

  useEffect(() => {
    if (selectedService) {
      setFormState({
        issueDetails: selectedService.issue_details || "",
        status: selectedService.status || "Received",
        actualCost: selectedService.actual_cost || "",
      });
    }
  }, [selectedService]);

  useEffect(() => {
    fetchServiceCount();
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddService = async () => {
    try {
      if (!formData.customerName || !formData.mobileNumber || !formData.mobileModel || !formData.issue) {
        throw new Error("Please fill all required fields");
      }
      const payload = {
        cus_name: formData.customerName,
        address: formData.address,
        mob_no: formData.mobileNumber,
        mob_model: formData.mobileModel,
        issue_details: formData.issue,
        status: formData.status,
        actual_cost: formData.actual_cost,
        advance: formData.advance,
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/mobile_service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: "Added!",
          description: "Service created successfully!",
          status: "success",
        });
        setFormData({
          customerName: "",
          mobileNumber: "",
          mobileModel: "",
          issue: "",
          status: "Received",
        });
        onClose();
      } else {
        showToast({
          title: "Failed!",
          description: "Failed to create service.",
          status: "error",
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
      });
      //console.error("Add service error:", error);
    } finally {
      fetchServices();
      fetchServiceCount();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "In Progress":
        return "blue";
      default:
        return "orange";
    }
  };

  const fetchServices = async (page = 1, date = "") => {
    setLoading(true); // <-- Set loading true
    const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/get_service`);
    url.searchParams.append("page", page);
    url.searchParams.append("limit", itemsPerPage);
    if (date) url.searchParams.append("date", date); // only attach if date selected

    try {
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
      setLoading(false); // <-- Set loading false
    }
  };

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage]);

  const fetchServiceCount = async () => {
    setLoading(true); // <-- Set loading true
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_service_count`);
      const data = await response.json();
      if (response.ok) {
        setServiceCount(data);
        console.log("servicecount", serviceCount);
      } else {
        console.error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Fetch services error:", error);
    } finally {
      setLoading(false); // <-- Set loading false
    }
  };

  function formatDateLocal(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  return (
    <Box overflow="hidden">
      {/* Page Header */}
      <Flex className="page-header">
        <Text className="page-title">Repayment</Text>
      </Flex>

      {/* Repayment Input Box */}
      <Card bg="white" borderRadius="lg" p={6} mb={8} boxShadow="0 4px 20px rgba(0,0,0,0.06)">
        <Text fontSize="1.1rem" fontWeight="600" mb={4}>
          Repayment Entry
        </Text>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          {/* Load No */}
          <FormControl>
            <FormLabel>Loan No</FormLabel>
            <Input
              placeholder="Enter loan no"
              // value={repayment.loadNo}
              // onChange={(e) => setRepayment({ ...repayment, loadNo: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Mobile</FormLabel>
            <Input
              placeholder="Enter mobile no"
              // value={repayment.loadNo}
              // onChange={(e) => setRepayment({ ...repayment, loadNo: e.target.value })}
            />
          </FormControl>

          {/* Area */}
          <FormControl>
            <FormLabel>Area</FormLabel>
            <Select
              placeholder="Select area"
              // value={repayment.area}
              // onChange={(e) => setRepayment({ ...repayment, area: e.target.value })}
            >
              <option value="Thanjavur">Thanjavur</option>
              <option value="Trichy">Trichy</option>
              <option value="Ariyalur">Ariyalur</option>
            </Select>
          </FormControl>

          {/* Name / Customer */}
          <FormControl>
            <FormLabel>Customer Name</FormLabel>
            <Select
              placeholder="Select customer"
              // value={repayment.customer}
              // onChange={(e) => setRepayment({ ...repayment, customer: e.target.value })}
            >
              {/* {customerList?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))} */}
            </Select>
          </FormControl>

          {/* Loan Amount */}
          <FormControl>
            <FormLabel>Due Amount</FormLabel>
            <Input
              type="number"
              // value={repayment.loanAmount}
              placeholder="Loan amount"
              // onChange={(e) => setRepayment({ ...repayment, loanAmount: e.target.value })}
            />
          </FormControl>

          {/* Payment */}
          <FormControl>
            <FormLabel>Payment</FormLabel>
            <Input
              type="number"
              //value={repayment.payment}
              placeholder="Enter payment"
              // onChange={(e) => {
              //   const payment = e.target.value;
              //   const balance = Number(repayment.loanAmount || 0) - Number(payment || 0);

              //   setRepayment({
              //     ...repayment,
              //     payment,
              //     balance: balance < 0 ? 0 : balance,
              //   });
              // }}
            />
          </FormControl>

          {/* Balance (Auto) */}
          <FormControl>
            <FormLabel>Balance</FormLabel>
            <Input type="number" isReadOnly value={0} />
          </FormControl>
        </SimpleGrid>

        {/* Buttons */}
        <Flex mt={6} justify="flex-end" gap={3}>
          <Button variant="outline" colorScheme="gray" onClick={() => setRepayment(initialState)}>
            Cancel
          </Button>

          <Button colorScheme="purple">Pay</Button>
        </Flex>
      </Card>

      {/* Services Table */}
      <Card className="table-card">
        <CardHeader className="page-header">
          <Text color={"black"} fontWeight={"500"}>
            Repayment History
          </Text>

          <Input
            type="date"
            size="sm"
            className="input-primary input-small"
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
              {/* Scrollable wrapper */}
              <Box className="table-scroll">
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
                    </Tr>
                  </Thead>

                  <Tbody>
                    {services.map((service) => (
                      <Tr key={service.id}>
                        <Td className="clickable-id">{service.serviceNo}</Td>

                        <Td className="clickable-id" onClick={() => handleEdit(service.service_id)}>
                          {service.customerName}
                        </Td>

                        <Td>{service.mobileModel}</Td>
                        <Td>{service.mobileNumber}</Td>

                        <Td className="text-left">{service.issue}</Td>

                        <Td>
                          <Tag colorScheme={getStatusColor(service.status)} size="sm" borderRadius="full">
                            <TagLabel>{service.status}</TagLabel>
                          </Tag>
                        </Td>

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
                      </Tr>
                    ))}

                    {services.length === 0 && (
                      <Tr>
                        <Td colSpan="8" textAlign="center" color="#666">
                          No recent services found
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination Footer */}
              <Flex className="pagination-footer">
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

      {loading && (
        <Box className="loading-overlay">
          <Spinner size="xl" color="#625DF0" thickness="4px" mb={2} />
          <Text className="loading-text">Retrieving records, please wait...</Text>
        </Box>
      )}
    </Box>
  );
};

export default Repayment;
