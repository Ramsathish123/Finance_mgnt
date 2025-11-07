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
  Tooltip,
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
  Select,
  Card,
  IconButton,
  CardHeader,
  CardBody,
  Avatar,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
  SimpleGrid,
  useToast,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FiEye, FiTrash2, FiSearch } from "react-icons/fi";
import axios from "axios";

const Report = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();

  const cancelRef = useRef();
  const toast = useToast();

  const [formData, setFormData] = useState({
    invoiceNo: "",
    customerName: "",
    mobileNumber: "",
    Amount: "",
  });
  const [services, setServices] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [report, setReport] = useState(null);
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  const [loading, setLoading] = useState(false); // Spinner state

  const cardBg = useColorModeValue("white", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.600");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:9988/get_invoice");
      const data = await response.json();
      if (response.ok) {
        const formatted = data.map((item, index) => ({
          id: item.id || index + 1,
          invoiceNo: item.invoice_id,
          customerName: item.customer_name,
          mobileNumber: item.mobile_number,
          amount: item.total,
          cre_date: item.created_at,
          discount: item.discount,
          total: item.final_amount,
        }));
        setInvoiceData(formatted);
      } else {
        console.error("Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Fetch invoices error:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (invoiceNo) => {
    setSelectedInvoiceNo(invoiceNo);
    onAlertOpen();
  };

  const handleDelete = async (invoiceNo) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:9988/delete_invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNo }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Deleted",
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchInvoices(); // refresh list
      } else {
        toast({
          title: "Delete failed",
          description: data.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting invoice",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handeleSearch = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (formData.startDate) queryParams.append("startDate", formData.startDate);
      if (formData.endDate) queryParams.append("endDate", formData.endDate);

      const endpoint =
        formData.type === "service" ? "http://localhost:9988/service_filter" : "http://localhost:9988/invoice_filter";

      const response = await fetch(`${endpoint}?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.totalCost);
        if (formData.type === "service") {
          const formatted = data.data.map((item, index) => ({
            id: item.id || index + 1,
            service_no: item.service_no,
            customer_name: item.cus_name,
            issue_details: item.issue_details,
            amount: item.actual_cost,
            delivery_date: item.created_at,
          }));
          setServiceData(formatted);
        } else {
          const formatted = data.data.map((item, index) => ({
            id: item.id || index + 1,
            invoiceNo: item.invoice_id,
            customerName: item.customer_name,
            mobileNumber: item.mobile_number,
            amount: item.total,
            cre_date: item.created_at,
          }));
          setInvoiceData(formatted);
        }

        setFormData((prev) => ({
          ...prev,
          startDate: "",
          endDate: "",
        }));
      } else {
        console.error("Search fetch failed");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleOpen = async () => {
    setLoading(true);
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const dd = String(today.getDate()).padStart(2, "0");
      const currentDate = `${yyyy}-${mm}-${dd}`;

      // Fetch daily report with current date
      const response = await fetch(`http://localhost:9988/daily_report?startDate=${currentDate}`);
      const data = await response.json();

      setReport(data);
      onOpen();
    } catch (error) {
      console.error("Error fetching daily report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (invoiceNo) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9988/invoice-rep/${invoiceNo}`);
      if (response.data.length === 0) {
        setInvoiceItems([]);
        setInvoiceDiscount(0);
        setInvoiceTotal(0); // Reset total
      } else {
        setInvoiceItems(response.data);
        const firstItem = response.data[0];
        const discount = parseFloat(firstItem?.discount) || 0;
        const total = parseFloat(firstItem?.total) || 0;

        // Set values
        setInvoiceDiscount(discount);
        setInvoiceTotal(total - discount);
        onReportOpen();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate subtotal
  const calculateSubtotal = () => {
    // Sum the 'amount' field from all items, converting to number
    return invoiceItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const subtotal = calculateSubtotal();

  // Convert numerical values to fixed two decimal strings for display
  const formatCurrency = (value) => `₹${Number(value).toFixed(2)}`;

  return (
    <>
      {loading ? (
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
            Retriving records, this may take a moment… {""}
          </Text>
        </Box>
      ) : (
        <Box p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.900")} minH="100vh">
          {/* Page Header */}
          <Flex justify="space-between" align="center" mb={4}>
            <Heading
              fontSize={{ base: "2xl", md: "2xl" }}
              fontFamily="Orbitron, Segoe UI, sans-serif"
              fontWeight="semibold"
              color="blue.600"
            >
              Report
            </Heading>
            <Button colorScheme="blue" onClick={handleOpen}>
              Daily Report
            </Button>
          </Flex>

          {/* Filter card */}
          <Card
            bg={useColorModeValue("white", "gray.800")}
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            mb={6}
          >
            <CardBody>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
                <Input
                  type="date"
                  size="sm"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="Start Date"
                />
                <Input
                  type="date"
                  size="sm"
                  value={formData.endDate || ""}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  placeholder="End Date"
                />
                <Select
                  placeholder="Select Type"
                  size="sm"
                  value={formData.type || ""}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="invoice">Invoice</option>
                  <option value="service">Service</option>
                </Select>
                <Input isReadOnly size="sm" value={services} placeholder="Total Amount" />
                <Button leftIcon={<FiSearch />} colorScheme="blue" onClick={handeleSearch} size="sm" width="100%">
                  Search
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Table card */}
          <Card
            bg={tableBg}
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <CardHeader borderBottomWidth="1px" borderColor={borderColor}>
              <Heading size="md" fontFamily="Orbitron, Segoe UI, sans-serif" fontWeight="semibold">
                {formData.type === "service" ? "Recent Services" : "Recent Invoices"}
              </Heading>
            </CardHeader>

            <CardBody px={0}>
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg={useColorModeValue("blue.50", "blue.900")}>
                    {formData.type === "service" ? (
                      <Tr>
                        <Th>Service No</Th>
                        <Th>Customer Name</Th>
                        <Th>Issue</Th>
                        <Th>Amount</Th>
                        <Th>Date</Th>
                      </Tr>
                    ) : (
                      <Tr>
                        <Th>Invoice No</Th>
                        <Th>Name</Th>
                        <Th>Mobile</Th>
                        <Th>Amount</Th>
                        <Th>Discount</Th>
                        <Th>Received Amt</Th>
                        <Th>Date</Th>
                        <Th>Action</Th>
                      </Tr>
                    )}
                  </Thead>
                  <Tbody>
                    {(formData.type === "service" ? serviceData : invoiceData).map((item, idx) => (
                      <Tr key={idx} _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                        {formData.type === "service" ? (
                          <>
                            <Td>{item.service_no}</Td>
                            <Td>{item.customer_name}</Td>
                            <Td>{item.issue_details}</Td>
                            <Td>{item.amount}</Td>

                            <Td>{item.delivery_date}</Td>
                          </>
                        ) : (
                          <>
                            <Td>{item.invoiceNo}</Td>
                            <Td>
                              <Flex align="center">
                                {/* <Avatar name={item.customerName} size="sm" mr={2} /> */}
                                {item.customerName}
                              </Flex>
                            </Td>
                            <Td>{item.mobileNumber}</Td>
                            <Td>{item.amount}</Td>
                            <Td>{item.discount}</Td>
                            <Td>{item.total}</Td>
                            <Td>{item.cre_date}</Td>
                            <Td textAlign="center">
                              <Flex justify="" gap={2}>
                                <Tooltip label="Preview" placement="top" hasArrow>
                                  <IconButton
                                    icon={<FiEye />}
                                    aria-label="View"
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => handleView(item.invoiceNo)}
                                  />
                                </Tooltip>
                                <Tooltip label="Delete Row" placement="top" hasArrow>
                                  <IconButton
                                    icon={<FiTrash2 />}
                                    aria-label="Delete"
                                    colorScheme="red"
                                    size="sm"
                                    onClick={() => confirmDelete(item.invoiceNo)}
                                  />
                                </Tooltip>
                              </Flex>
                            </Td>
                          </>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>

          {/* Daily Report Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Daily Report</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {report ? (
                  <Table variant="simple" size="sm">
                    <Thead bg={useColorModeValue("blue.50", "blue.900")}>
                      <Tr>
                        <Th>Metric</Th>
                        <Th isNumeric>Value</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Number of Invoices</Td>
                        <Td isNumeric>{report.invoiceCount}</Td>
                      </Tr>
                      <Tr>
                        <Td>Total Invoice Sale</Td>
                        <Td isNumeric>₹{report.totalInvoiceSale}</Td>
                      </Tr>
                      <Tr>
                        <Td>Delivered Services</Td>
                        <Td isNumeric>{report.deliveredCount}</Td>
                      </Tr>
                      <Tr>
                        <Td>Total Delivered Cost</Td>
                        <Td isNumeric>₹{report.totalDeliveredCost}</Td>
                      </Tr>
                      <Tr>
                        <Td>Received Services</Td>
                        <Td isNumeric>{report.receivedCount}</Td>
                      </Tr>
                      <Tr>
                        <Td>Today's Total Sale</Td>
                        <Td isNumeric>₹{report.todayTotalSale}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                ) : (
                  <p>Loading...</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Confirm Delete AlertDialog */}
          <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Invoice
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to delete this invoice? This action cannot be undone.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onAlertClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      handleDelete(selectedInvoiceNo);
                      onAlertClose();
                    }}
                    ml={3}
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          {/* Invoice Details Modal */}
          <Modal isOpen={isReportOpen} onClose={onReportClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Invoice Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Table variant="striped" colorScheme="gray">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th isNumeric>Qty</Th>
                      <Th isNumeric>Rate</Th>
                      <Th isNumeric>Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {invoiceItems.map((item, index) => (
                      <Tr key={index}>
                        <Td>{item.product_name}</Td>
                        <Td isNumeric>{item.quantity}</Td>
                        <Td isNumeric>{formatCurrency(item.rate)}</Td>
                        <Td isNumeric>{formatCurrency(item.amount)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Clear Totals Section */}
                <Flex direction="column" align="flex-end" mt={6} pr={4}>
                  <Flex justify="space-between" width="300px" mb={1}>
                    <Text fontWeight="normal">Subtotal:</Text>
                    <Text fontWeight="normal">{formatCurrency(subtotal)}</Text>
                  </Flex>
                  <Flex justify="space-between" width="300px" mb={1}>
                    <Text fontWeight="normal">Discount:</Text>
                    <Text fontWeight="normal" color="red.500">
                      - {formatCurrency(invoiceDiscount)}
                    </Text>
                  </Flex>
                  <Box borderTop="2px solid" borderColor="gray.300" pt={2} width="300px">
                    <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                      <Text>Total Amount:</Text>
                      <Text>{formatCurrency(invoiceTotal)}</Text>
                    </Flex>
                  </Box>
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onReportClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
    </>
  );
};

export default Report;
