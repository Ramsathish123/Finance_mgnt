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
} from "@chakra-ui/react";
import { FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";

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
        toast({
          title: "Success",
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
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
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 9988,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchExpenses(currentPage);
  }, [currentPage]);

  const fetchExpenses = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:9988/expense?page=${page}&limit=10`);
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
      const response = await axios.delete(`http://localhost:9988/expense/${id}`);

      toast({
        title: "Success",
        description: response.data.message || "Item deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchExpenses();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete item",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Delete error:", error);
    }
  };

  const handleSearch = async () => {
    try {
      if (!fromDate) {
        toast({
          title: "Date Required",
          description: "Please select both From and To dates",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await axios.get(`http://localhost:9988/expense/search`, {
        params: { startDate: fromDate, endDate: toDate },
      });

      setExpenses(response.data); // update the state
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch filtered expenses",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const tableBg = useColorModeValue("white", "gray.800");

  return (
    <Box p={{ base: 4, md: 8 }} minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Header and Add Button */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Heading
          fontSize={{ base: "2xl", md: "2xl" }}
          fontWeight="semibold"
          color="blue.600"
          fontFamily="Orbitron, Segoe UI, sans-serif"
        >
          Expense Tracker
        </Heading>

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
            leftIcon={<FiSearch />}
            colorScheme="blue"
            onClick={handleSearch}
            size="sm"
            variant="solid"
            px={6}
          ></Button>
        </HStack>
      </Flex>
      <Card bg={tableBg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} overflow="hidden">
        <CardHeader borderBottomWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Heading size="md" fontFamily="Orbitron, Segoe UI, sans-serif" fontWeight="semibold">
              Expense details
            </Heading>
            <Button colorScheme="blue" onClick={onOpen}>
              Add
            </Button>
          </Flex>
        </CardHeader>

        <CardBody px={0}>
          <Table variant="simple" size="md">
            <Thead bg={useColorModeValue("blue.50", "blue.900")}>
              <Tr>
                <Th>Invoice No</Th>
                <Th>Description</Th>
                <Th isNumeric>Amount (₹)</Th>
                <Th>Date</Th>
                <Th textAlign="center">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {expenses.map((item) => (
                <Tr key={item.id} _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                  <Td>{item.invoice_no}</Td>
                  <Td>{item.detail}</Td>
                  <Td isNumeric>₹{item.amount}</Td>
                  <Td>{item.created_at}</Td>
                  <Td textAlign="center">
                    <Tooltip label="Delete Item" placement="right" hasArrow>
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Delete"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(item.eid)}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justify="center" mt={4} gap={2}>
            <Button
              size="sm"
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
                size="sm"
                variant={currentPage === i + 1 ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() => {
                  setCurrentPage(i + 1);
                  fetchExpenses(i + 1);
                }}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              size="sm"
              onClick={() => {
                const newPage = Math.min(currentPage + 1, totalPages);
                setCurrentPage(newPage);
                fetchExpenses(newPage);
              }}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
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
        <ModalContent borderRadius="lg">
          <ModalHeader>Add New Expense</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
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
                <Input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Enter description" />
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
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddExpense}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Expense;
