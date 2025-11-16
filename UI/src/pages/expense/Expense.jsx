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
  useBreakpointValue,
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
  useColorModeValue,
  IconButton,
  useToast,
  Card,
  CardHeader,
  HStack,
  Tooltip,
  CardBody,
  Text,
} from "@chakra-ui/react";
import { FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";
const Expense = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [invoiceNo, setInvoiceNo] = useState("");
  const [detail, setDetail] = useState("");
  const [amount, setAmount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.100", "gray.600");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const handleAddExpense = async () => {
    try {
      if (!invoiceNo || !detail || !amount) {
        throw new Error("Please fill all required fields");
      }
      const response = await fetch("http://localhost:9988/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNo,
          detail,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: "Success",
          description: data.message,
          status: "success",
        });
        fetchExpenses();
        setInvoiceNo("");
        setDetail("");
        setAmount("");
        onClose();

        // Optional: Refresh the table from backend if you have a GET route
      } else {
        alert(data.message || "Failed to add expense");
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchExpenses(currentPage);
  }, [currentPage]);

  const fetchExpenses = async (page = 1) => {
    try {
      const response = await fetch(
        `http://localhost:9988/expense?page=${page}&limit=10`
      );
      const data = await response.json();
      setExpenses(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:9988/expense/${id}`
      );

      showToast({
        title: "Success",
        description: response.data.message || "Item deleted successfully",
        status: "success",
      });

      fetchExpenses();
    } catch (error) {
      showToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete item",
        status: "error",
      });
      console.error("Delete error:", error);
    }
  };

  const handleSearch = async () => {
    try {
      if (!fromDate) {
        showToast({
          title: "Date Required",
          description: "Please select both From and To dates",
          status: "warning",
        });
        return;
      }

      const response = await axios.get(`http://localhost:9988/expense/search`, {
        params: { startDate: fromDate, endDate: toDate },
      });

      setExpenses(response.data); // update the state
    } catch (error) {
      console.error("Search error:", error);
      showToast({
        title: "Error",
        description: "Failed to fetch filtered expenses",
        status: "error",
      });
    }
  };

  const tableBg = useColorModeValue("white", "gray.800");

  return (
    <Box overflow="hidden">
      {/* Page Header */}
      <Flex className="page-header">
        <Text className="page-title">Expense Tracker</Text>

        <HStack>
          <Input
            type="date"
            size="sm"
            value={fromDate || ""}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="Start Date"
          />
          <Input
            type="date"
            size="sm"
            value={toDate || ""}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="End Date"
          />
          <Button
            onClick={handleSearch}
            size="sm"
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "28px",
              height: "28px",
            }}
          >
            <FiSearch style={{ width: "35px", height: "35px" }} />
          </Button>
        </HStack>
      </Flex>
      <Card className="table-card">
        <CardHeader className="page-header">
          <Text color={"black"} fontWeight={"500"}>
            Expense Details
          </Text>

          <Button className="btn-primary" size="sm" onClick={onOpen}>
            + Add
          </Button>
        </CardHeader>

        <CardBody px={0}>
          <Box className="table-scroll">
            <Table className="table" size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Invoice No</Th>
                  <Th>Description</Th>
                  <Th className="text-right">Amount (₹)</Th>
                  <Th>Date</Th>
                  <Th textAlign="center">Action</Th>
                </Tr>
              </Thead>

              <Tbody>
                {expenses.map((item) => (
                  <Tr key={item.id}>
                    <Td>{item.invoice_no}</Td>
                    <Td>{item.detail}</Td>
                    <Td className="text-right">₹{item.amount}</Td>
                    <Td>{item.created_at}</Td>

                    <Td>
                      <Flex justify="center">
                        <Tooltip label="Delete Item" bg="#625DF0" color="white">
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Delete"
                            size="xs"
                            className="table-action-btn delete"
                            onClick={() => handleDelete(item.eid)}
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          <Flex className="pagination-footer">
            <Text className="pagination-text">
              Showing {expenses.length} items
            </Text>

            <HStack spacing={2}>
              <Button
                size="xs"
                className="pagination-btn"
                onClick={() => {
                  const newPage = Math.max(currentPage - 1, 1);
                  setCurrentPage(newPage);
                  fetchExpenses(newPage);
                }}
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
                  onClick={() => {
                    setCurrentPage(i + 1);
                    fetchExpenses(i + 1);
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
                  fetchExpenses(newPage);
                }}
                isDisabled={currentPage === totalPages}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {expenses.length === 0 && (
        <Box textAlign="center" py={6} fontStyle="italic" color="gray.500">
          No expenses recorded.
        </Box>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent className="modal-box">
          <ModalHeader className="modal-header">Add New Expense</ModalHeader>
          <ModalCloseButton />
          <ModalBody className="modal-body">
            <Stack spacing={4} className="modal-form">
              <FormControl>
                <FormLabel>Invoice No</FormLabel>
                <Input
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="Enter invoice number"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Detail</FormLabel>
                <Input
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Enter description"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Amount (₹)</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
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
            <Button
              className="btn-primary"
              size="sm"
              onClick={handleAddExpense}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Expense;
