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

const Service = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [formData, setFormData] = useState({
    serviceNo: "",
    customerName: "",
    mobileNumber: "",
    mobileModel: "",
    issue: "",
    status: "Received",
    advance: "" || 0.00,
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

      const response = await fetch("http://localhost:9988/mobile_service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Added!",
          description: "Service created successfully!",
          status: "success",
          duration: 4000,
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
        toast({
          title: "Failed!",
          description: "Failed to create service.",
          status: "error",
          duration: 4000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 9988,
        isClosable: true,
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
    const url = new URL("http://localhost:9988/get_service");
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
      const response = await fetch("http://localhost:9988/get_service_count");
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

  const handleUpdate = async () => {
    const payload = {
      service_id: formState.service_id,
      issue_details: formState.issueDetails,
      status: formState.status,
      actual_cost: parseFloat(formState.actualCost),
      advance: parseFloat(formState.advanceCost),
    };

    const response = await fetch("http://localhost:9988/update_service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toast({
        title: "Updated!",
        description: "Service updated successfully.",
        status: "success",
        duration: 4000,
      });
      await fetchServices();
      await fetchServiceCount();
      onServicePrintClose();
    } else {
      toast({
        title: "Error",
        description: "Failed to update service.",
        status: "error",
        duration: 4000,
      });
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
  const handlePrint = async (id) => {
    const updatedData = await fetch(`http://localhost:9988/get_service_by_id/${id}`);
    const serviceData = await updatedData.json();

    // Format for printReceipt
    const receiptData = {
      service_no: serviceData.service_no,
      customerName: serviceData.cus_name,
      mobileNumber: serviceData.mob_no,
      amount: serviceData.actual_cost,
      advance: serviceData.advance,
      product: serviceData.mob_model,
      issue: serviceData.issue_details,
      status: serviceData.status,
      address: serviceData.address,
      delivery_date: formatDateLocal(serviceData.delivery_date), // dd-mm-yyyy
    };

    printReceipt(receiptData);
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.post(`http://localhost:9988/services/${id}`);
      const data = response.data;
      setFormState({
        service_id: data.service_id,
        issueDetails: data.issueDetails || "",
        status: data.status, // force Delivered here
        advanceCost: data.advance || "",
        actualCost: data.actualCost || "",
        balanceCost: data.balance || "",
      });

      onServicePrintOpen(); // Open modal
    } catch (error) {
      console.error("Failed to fetch service data:", error);
    }
  };

  const printReceipt = (data) => {
    const receiptWindow = window.open("", "PRINT", "height=600,width=800");

    const { service_no, customerName, mobileNumber, product, issue, amount, advance, status, address, delivery_date } =
      data;

    const balance = (parseFloat(amount || 0) - parseFloat(advance || 0)).toFixed(2);

    const receiptHTML = `
    <html>
    <head>
      <style>
        @media print {
          @page {
            size: A5 portrait;
            margin: 10mm;
          }
        }
        body {
          font-family: monospace;
          font-size: 12px;
          margin: 0;
          padding: 0;
        }
        .receipt-container {
          width: 100%;
          padding: 10px;
          box-sizing: border-box;
          margin: auto;
          position: relative;
        }
        .center {
          text-align: center;
        }
        .bold {
          font-weight: bold;
        }
        .line {
          border-top: 1px solid black;
          margin: 6px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .description-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
        }
        .description-table td {
          padding: 4px 2px;
          vertical-align: top;
        }
        .right {
          text-align: right;
        }
 

    /* Texture & depth */
    background: radial-gradient(circle at center, rgba(0, 162, 255, 0.15), rgba(0, 162, 255, 0.05));
    box-shadow:
        0 0 12px rgba(0, 0, 0, 0.2), /* subtle shadow */
        inset 0 0 8px rgba(255, 255, 255, 0.2); /* inner emboss effect */

    /* Slightly worn effect */
    filter: contrast(1.2) brightness(1.1);
}

}

        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="center bold">Muthu Mobiles</div>
        <div class="center">Uranipuram</div>
        <div class="center">Mob:9791611603,9363230745</div>
        <div class="line"></div>

        <div class="row">
          <div><b>Service No:</b> ${service_no}</div>
          <div><b>Date:</b> ${delivery_date}</div>
        </div>
        <div class="row">
          <div><b>Customer:</b> ${customerName},${address}</div>
          <div><b>Mobile No:</b> ${mobileNumber}</div>
        </div>
        <div class="line"></div>
        <table class="description-table">
          <tr>
            <td><b>Model</b></td>
            <td>${product}</td>
          </tr>
          <tr>
            <td><b>Issue</b></td>
            <td>${issue}</td>
          </tr>
           
          <tr>
            <td><b>Advance</b></td>
            <td class="right">₹${parseFloat(advance || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td><b>Received Amt</b></td>
            <td class="right">₹${balance}</td>
          </tr>
         <tr>
            <td><b>Total</b></td>
            <td class="right">₹${parseFloat(amount || 0).toFixed(2)}</td>
          </tr>
        </table>

        <div class="line"></div>
        <div class="center">Thank you! Visit Again</div>
      </div>
      <div class="line"></div>

        <!-- Tamil Conditions Section -->
        <div class="conditions">
          <b>நிபந்தனைகள்:</b><br>
          ❖ பில் கொண்டு வந்தால் மட்டுமே செல்போன் திருப்பித் தரப்படும்.<br>
          ❖  நீங்கள் செல்போன்களை ஒப்படைத்துவிட்டு, அதை நான் தவறாகக் கொடுத்ததாக மறந்துவிட்டேன் என்று சொன்னால், அதற்கு நிறுவனம் பொறுப்பல்ல.பழுதுபார்ப்பதற்காக கொடுக்கப்பட்ட செல்போன்களை 10 நாட்களுக்குள் பெற்றுக்கொள்ள வேண்டும்.10 நாட்களுக்குள் செல்போன் வாங்கவில்லை என்றால், தொலைந்து போன செல்போன்களுக்கு நிறுவனம் பொறுப்பல்ல.<br>
          ❖ மாற்றுத்திறனாளிகள் மற்றும் துப்புரவுப் பணியாளர்களுக்கு சிறப்புச் சலுகைகள் உண்டு.<br> 
          <b>NO WARRANTY, NO GUARANTEE</b><br><br>
          <div>
            <b>Customer Signature</b> ________________________ 
            <span style="float:right;">For. Muthu Mobiles</span>
          </div>
        </div>
        <div class="line"></div>
        <div style="text-align:center">Thank you! Visit Again</div>
    </body>
    </html>
  `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
    receiptWindow.close();
  };

  // useEffect(() => {
  //   const advance = parseFloat(formState.advanceCost) || 0;
  //   const balance = parseFloat(formState.balCost) || 0;
  //   const total = advance + balance;

  //   setFormState((prev) => ({
  //     ...prev,
  //     actualCost: total,
  //   }));
  // }, [formState.advanceCost, formState.balCost]);

  return (
    <Box p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.900")} minH="100vh">
      <Flex justify="space-between" align="center" mb={8}>
        <Heading
          fontSize={{ base: "2xl", md: "2xl" }}
          fontFamily="Orbitron, Segoe UI, sans-serif"
          fontWeight="semibold"
          color="blue.600"
        >
          Device Services
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={() => {
            onAddserviceOpen();
            onOpen();
          }}
          size="md"
          variant="solid"
          px={6}
        >
          New Service
        </Button>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={8}>
        <Card bg={cardBg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Flex align="center">
              <Avatar icon={<FiPhone />} bg="blue.100" color="blue.600" mr={4} />
              <Box>
                <Text color="gray.500" fontSize="sm">
                  Total Services
                </Text>
                <Heading size="lg">{serviceCount?.[0]?.total_service ?? 0}</Heading>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Flex align="center">
              <Avatar icon={<FiAlertCircle />} bg="orange.100" color="orange.600" mr={4} />
              <Box>
                <Text color="gray.500" fontSize="sm">
                  Received
                </Text>
                <Heading size="lg">{serviceCount?.[0]?.received ?? 0}</Heading>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Flex align="center">
              <Avatar icon={<FiSmartphone />} bg="green.100" color="green.600" mr={4} />
              <Box>
                <Text color="gray.500" fontSize="sm">
                  Delivered
                </Text>
                <Heading size="lg">{serviceCount?.[0]?.delivered ?? 0}</Heading>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Services Table */}
      <Card bg={tableBg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} overflow="hidden">
        <CardHeader borderBottomWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Heading size="md" fontFamily="Orbitron, Segoe UI, sans-serif" fontWeight="semibold">
              Recent Service Requests
            </Heading>
            <Input
              type="date"
              size="sm"
              onChange={(e) => {
                const selected = e.target.value;
                setSearchDate(selected);
                setCurrentPage(1); // reset to first page
                fetchServices(1, selected); // fetch filtered
              }}
              placeholder="Start Date"
              maxW="200px" // optional, adjust width
            />
          </Flex>
        </CardHeader>

        <CardBody px={0}>
          {loading ? (
            <Flex justify="center" align="center" minH="200px">
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Flex>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg={useColorModeValue("blue.50", "blue.900")}>
                    <Tr>
                      <Th>Service No</Th>
                      <Th>Customer</Th>
                      <Th>Device</Th>
                      <Th>Contact</Th>
                      <Th>Issue</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {services.map((service) => (
                      <Tr
                        key={service.id}
                        _hover={{
                          bg: useColorModeValue("gray.50", "gray.700"),
                        }}
                      >
                        <Td fontWeight="600">{service.serviceNo}</Td>
                        <Td>
                          <Flex
                            align="center"
                            variant="link"
                            color="blue"
                            textDecoration={"underline"}
                            onClick={() => handleEdit(service.service_id)}
                          >
                            {service.customerName}
                          </Flex>
                        </Td>
                        <Td>{service.mobileModel}</Td>
                        <Td>{service.mobileNumber}</Td>
                        <Td maxW="200px" isTruncated>
                          {service.issue}
                        </Td>
                        <Td>
                          <Tag colorScheme={getStatusColor(service.status)} size="md" borderRadius="full">
                            <TagLabel>{service.status}</TagLabel>
                          </Tag>
                        </Td>
                        <Td>{service.date}</Td>
                        <Td textAlign="center">
                          <IconButton
                            icon={<FiPrinter />}
                            aria-label="Print"
                            colorScheme="red"
                            size="sm"
                            onClick={() => handlePrint(service.service_id)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Flex justify="center" mt={4} gap={2}>
                <Button
                  size="sm"
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
                    size="sm"
                    variant={currentPage === i + 1 ? "solid" : "outline"}
                    colorScheme="blue"
                    onClick={() => {
                      setCurrentPage(i + 1);
                      fetchServices(i + 1, searchdate);
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
                    fetchServices(newPage, searchdate);
                  }}
                  isDisabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </Flex>
            </>
          )}
        </CardBody>
      </Card>

      {/* Add Service Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            <Flex align="center">
              <Avatar icon={<FiPlus />} bg="blue.100" color="blue.600" mr={3} size="sm" />
              <Heading size="md">New Service Request</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Stack spacing={5}>
              {/* Customer Info */}
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Customer Name</FormLabel>
                  <Input
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    borderRadius="lg"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Mobile Number</FormLabel>
                  <Input
                    name="mobileNumber"
                    type="number"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter number"
                    borderRadius="lg"
                  />
                </FormControl>
              </Flex>

              {/* Address */}
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  placeholder="Enter customer address"
                  borderRadius="lg"
                />
              </FormControl>

              {/* Device Info */}
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Mobile Model</FormLabel>
                  <Input
                    name="mobileModel"
                    value={formData.mobileModel}
                    onChange={handleInputChange}
                    placeholder="Model"
                    borderRadius="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Total Amount</FormLabel>
                  <Input
                    name="actual_cost"
                    type="number"
                    value={formData.actual_cost || ""}
                    onChange={handleInputChange}
                    placeholder="Enter total"
                    borderRadius="lg"
                  />
                </FormControl>
              </Flex>

              {/* Payment Info */}
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Advance</FormLabel>
                  <Input
                    name="advance"
                    type="number"
                    value={formData.advance || ""}
                    onChange={handleInputChange}
                    placeholder="Enter advance"
                    borderRadius="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Balance (auto)</FormLabel>
                  <Input
                    isReadOnly
                    borderRadius="lg"
                    value={(parseFloat(formData.actual_cost || 0) - parseFloat(formData.advance || 0)).toFixed(2)}
                  />
                </FormControl>
              </Flex>

              {/* Issue */}
              <FormControl>
                <FormLabel>Complaint</FormLabel>
                <Textarea
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  placeholder="Describe the issue..."
                  borderRadius="lg"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
            <Button variant="outline" mr={3} onClick={onClose} borderRadius="lg">
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddService} borderRadius="lg">
              Create Service
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isServicePrintOpen} onClose={onServicePrintClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Service </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Issue Details</FormLabel>
                <Textarea
                  value={formState.issueDetails}
                  onChange={(e) => setFormState({ ...formState, issueDetails: e.target.value })}
                />
              </FormControl>

              <Flex gap={4}>
                <FormControl flex="1">
                  <FormLabel>Advance</FormLabel>
                  <Input
                    type="number"
                    value={formState.advanceCost}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        advanceCost: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </Flex>

              <Flex gap={4}>
                <FormControl flex="1">
                  <FormLabel>Balance</FormLabel>
                  <Input
                    type="number"
                    value={formState.balanceCost}
                    // onChange={(e) => setFormState({ ...formState, balCost: e.target.value })}
                  />
                </FormControl>

                <FormControl flex="1">
                  <FormLabel>Total</FormLabel>
                  <Input type="number" value={formState.actualCost} />
                </FormControl>
              </Flex>
            </Stack>
          </ModalBody>
          {console.log("formstate", formState.status)}
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdate} isDisabled={formState.status === "Delivered"}>
              Update
            </Button>

            <Button
              onClick={() => {
                onServicePrintClose(), setSelectedService("");
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
          <Text fontSize="xl" color="black.100" fontWeight="normal">
            Retrieving records, this may take a moment…{" "}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Service;
