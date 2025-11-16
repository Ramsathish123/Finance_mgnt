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
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const {
    isOpen: isReportOpen,
    onOpen: onReportOpen,
    onClose: onReportClose,
  } = useDisclosure();

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
      if (formData.startDate)
        queryParams.append("startDate", formData.startDate);
      if (formData.endDate) queryParams.append("endDate", formData.endDate);

      const endpoint =
        formData.type === "service"
          ? "http://localhost:9988/service_filter"
          : "http://localhost:9988/invoice_filter";

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
      const response = await fetch(
        `http://localhost:9988/daily_report?startDate=${currentDate}`
      );
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
      const response = await axios.get(
        `http://localhost:9988/invoice-rep/${invoiceNo}`
      );
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
    return invoiceItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
  };

  const subtotal = calculateSubtotal();

  // Convert numerical values to fixed two decimal strings for display
  const formatCurrency = (value) => `₹${Number(value).toFixed(2)}`;

  return (
    <>
      {loading ? (
        <Box className="loading-overlay">
          <Spinner size="xl" color="#625DF0" thickness="4px" mb={2} />
          <Text className="loading-text">
            Retrieving records, please wait...
          </Text>
        </Box>
      ) : (
        <Box overflow="hidden">
          {/* Page Header */}
          <Flex className="page-header">
            <Text className="page-title">Report</Text>
            <Button className="btn-primary" size="sm" onClick={handleOpen}>
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
              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3, lg: 5 }}
                spacing={4}
              >
                <Input
                  type="date"
                  size="sm"
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  placeholder="Start Date"
                />
                <Input
                  type="date"
                  size="sm"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  placeholder="End Date"
                />
                <Select
                  placeholder="Select Type"
                  size="sm"
                  value={formData.type || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="invoice">Invoice</option>
                  <option value="service">Service</option>
                </Select>
                <Input
                  isReadOnly
                  size="sm"
                  value={services}
                  placeholder="Total Amount"
                />
                <Button
                  leftIcon={<FiSearch />}
                  onClick={handeleSearch}
                  className="btn-primary"
                  size="sm"
                  gap={5}
                >
                  Search
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Table card */}
          <Card className="table-card">
            <CardHeader borderBottomWidth="1px" borderColor={borderColor}>
              <Flex justify="space-between" align="center">
                <Text color={"black"} fontWeight={500}>
                  {formData.type === "service"
                    ? "Recent Services"
                    : "Recent Invoices"}
                </Text>
              </Flex>
            </CardHeader>

            <CardBody px={0} pb={0}>
              <Box className="table-scroll">
                <Table className="table" size="sm">
                  <Thead>
                    {formData.type === "service" ? (
                      <Tr>
                        <Th>Service No</Th>
                        <Th>Customer</Th>
                        <Th>Issue</Th>
                        <Th className="text-right">Amount</Th>
                        <Th>Date</Th>
                      </Tr>
                    ) : (
                      <Tr>
                        <Th>Invoice No</Th>
                        <Th>Name</Th>
                        <Th>Mobile</Th>
                        <Th className="text-right">Amount</Th>
                        <Th className="text-right">Discount</Th>
                        <Th className="text-right">Received</Th>
                        <Th>Date</Th>
                        <Th textAlign="center">Action</Th>
                      </Tr>
                    )}
                  </Thead>

                  <Tbody>
                    {(formData.type === "service"
                      ? serviceData
                      : invoiceData
                    ).map((item, idx) => (
                      <Tr key={idx}>
                        {formData.type === "service" ? (
                          <>
                            <Td>{item.service_no}</Td>
                            <Td>{item.customer_name}</Td>
                            <Td maxW="200px" isTruncated>
                              {item.issue_details}
                            </Td>
                            <Td className="text-right">₹{item.amount}</Td>
                            <Td>{item.delivery_date}</Td>
                          </>
                        ) : (
                          <>
                            <Td>{item.invoiceNo}</Td>
                            <Td>{item.customerName}</Td>
                            <Td>{item.mobileNumber}</Td>
                            <Td className="text-right">₹{item.amount}</Td>
                            <Td className="text-right">{item.discount}</Td>
                            <Td className="text-right">{item.total}</Td>
                            <Td>{item.cre_date}</Td>

                            <Td textAlign="center">
                              <Flex justify="center" gap={2}>
                                <Tooltip
                                  label="Preview"
                                  bg="#625DF0"
                                  color="white"
                                >
                                  <IconButton
                                    icon={<FiEye />}
                                    aria-label="View"
                                    size="xs"
                                    className="table-action-btn view"
                                    onClick={() => handleView(item.invoiceNo)}
                                  />
                                </Tooltip>

                                <Tooltip
                                  label="Delete"
                                  bg="#625DF0"
                                  color="white"
                                >
                                  <IconButton
                                    icon={<FiTrash2 />}
                                    aria-label="Delete"
                                    size="xs"
                                    className="table-action-btn delete"
                                    onClick={() =>
                                      confirmDelete(item.invoiceNo)
                                    }
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
          <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay />
            <ModalContent className="modal-box">
              <ModalHeader className="modal-header">Daily Report</ModalHeader>
              <ModalCloseButton />
              <ModalBody className="modal-body">
                {report ? (
                  <Table className="table" border="2px solid #dee1ff">
                    <Thead>
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
              <ModalFooter className="modal-footer">
                <Button className="btn-primary" size="sm" onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Confirm Delete AlertDialog */}
          {/* Delete Invoice Modal */}
          <Modal isOpen={isAlertOpen} onClose={onAlertClose} isCentered>
            <ModalOverlay />
            <ModalContent className="modal-box">
              <ModalHeader className="modal-header">Delete Invoice</ModalHeader>
              <ModalCloseButton />

              <ModalBody className="modal-body">
                <Text>
                  Are you sure you want to delete this invoice? This action
                  cannot be undone.
                </Text>
              </ModalBody>

              <ModalFooter className="modal-footer">
                <Button
                  className="btn-cancel"
                  variant="ghost"
                  size="sm"
                  onClick={onAlertClose}
                >
                  Cancel
                </Button>

                <Button
                  className="btn-danger"
                  size="sm"
                  onClick={() => {
                    handleDelete(selectedInvoiceNo);
                    onAlertClose();
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Invoice Details Modal */}

          <Modal
            isOpen={isReportOpen}
            onClose={onReportClose}
            size="lg"
            isCentered
          >
            <ModalOverlay />
            <ModalContent className="modal-box">
              <ModalHeader className="modal-header">
                Invoice Details
              </ModalHeader>
              <ModalCloseButton />

              <ModalBody className="modal-body">
                <Box className="table-card">
                  <Box className="table-scroll">
                    <Table className="table">
                      <Thead>
                        <Tr>
                          <Th>Product</Th>
                          <Th className="text-right">Qty</Th>
                          <Th className="text-right">Rate</Th>
                          <Th className="text-right">Amount</Th>
                        </Tr>
                      </Thead>

                      <Tbody>
                        {invoiceItems.map((item, index) => (
                          <Tr key={index}>
                            <Td>{item.product_name}</Td>
                            <Td className="text-right">{item.quantity}</Td>
                            <Td className="text-right">
                              {formatCurrency(item.rate)}
                            </Td>
                            <Td className="text-right">
                              {formatCurrency(item.amount)}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>

                {/* Totals Section */}
                <Flex direction="column" align="flex-end" mt={4} pr={2} gap={1}>
                  <Flex justify="space-between" width="260px">
                    <Text>Subtotal:</Text>
                    <Text>{formatCurrency(subtotal)}</Text>
                  </Flex>

                  <Flex justify="space-between" width="260px">
                    <Text>Discount:</Text>
                    <Text style={{ color: "#E53E3E" }}>
                      - {formatCurrency(invoiceDiscount)}
                    </Text>
                  </Flex>

                  <Box
                    width="260px"
                    borderTop="2px solid #cdd1f5"
                    pt={2}
                    mt={1}
                  >
                    <Flex justify="space-between" fontWeight="600">
                      <Text>Total Amount:</Text>
                      <Text>{formatCurrency(invoiceTotal)}</Text>
                    </Flex>
                  </Box>
                </Flex>
              </ModalBody>

              <ModalFooter className="modal-footer">
                <Button
                  className="btn-primary"
                  size="sm"
                  onClick={onReportClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
    </>
  );
};

export default Report;
