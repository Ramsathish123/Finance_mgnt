import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Flex,
  Heading,
  useToast,
  Spinner,
  Text,
  Card,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import axios from "axios";

const Invoice = () => {
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [discount, setDiscount] = useState("");
  const [rows, setRows] = useState([]);
  const headerColor = useColorModeValue("blue.600", "blue.300");
  const toast = useToast();
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableBg = useColorModeValue("white", "gray.800");

  const [productList, setProductList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const netAmount = totalAmount - (Number(discount) || 0);

  useEffect(() => {
    handleGetInvoiceNo();
    handleFetchProducts();
  }, []);

  const handleFetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:9988/api/products/all");
      const normalized = (res.data || []).map((p) => ({
        ...p,
        rate: Number(p.rate) || 0,
      }));
      setProductList(normalized);
      setFilteredList(normalized);
    } catch {
      toast({
        title: "Error fetching products",
        description: "Check server connection.",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetInvoiceNo = async () => {
    try {
      const res = await axios.post("http://localhost:9988/invoiceNo/");
      setInvoiceNo(res.data.invoiceNo);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (value) => {
    setQuery(value);
    setIsOpen(true);
    if (!value.trim()) {
      setFilteredList(productList);
      return;
    }
    const filtered = productList.filter((p) => p.productName.toLowerCase().includes(value.toLowerCase()));
    setFilteredList(filtered);
  };

  const handleSelectProduct = (p) => {
    setSelectedProduct(p);
    setQuery(p.productName);
    setIsOpen(false);
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast({ title: "Select a product", status: "warning" });
      return;
    }

    const rate = Number(selectedProduct.rate || 0);
    const qty = Number(quantity || 0);
    if (qty <= 0) {
      toast({ title: "Enter a valid quantity", status: "warning" });
      return;
    }

    const amount = rate * qty;
    const already = rows.find((r) => r.productId === selectedProduct.productId);
    if (already) {
      toast({ title: "Product already added", status: "info" });
      return;
    }

    const newRow = {
      productId: selectedProduct.productId,
      productName: selectedProduct.productName,
      rate: rate,
      quantity: qty,
      amount: amount,
    };
    setRows([...rows, newRow]);
    setSelectedProduct(null);
    setQuery("");
    setQuantity(1);
  };

  const handleRemove = (id) => {
    setRows(rows.filter((r) => r.productId !== id));
  };

  const handleSave = async () => {
    if (rows.length === 0) {
      toast({ title: "Add at least one product", status: "warning" });
      return;
    }

    const payload = {
      customerName,
      mobileNumber,
      total: totalAmount,
      discount: discount || 0,
      items: rows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        rate: r.rate,
        quantity: r.quantity,
        amount: r.amount,
      })),
    };

    try {
      const res = await fetch("http://localhost:9988/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Invoice Saved!", status: "success" });
        printReceipt({
          ...payload,
          billNo: data.invoiceId,
          date: new Date().toLocaleDateString(),
          billTotal: netAmount,
        });
        setRows([]);
        setCustomerName("");
        setMobileNumber("");
        setDiscount("");
        handleGetInvoiceNo();
      } else {
        toast({ title: "Save failed", description: data.error, status: "error" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  const printReceipt = (data) => {
    const { customerName, mobileNumber, items, billTotal, total, discount, billNo, date } = data;
    const html = `
      <html><head><style>
      body{font-family:monospace;font-size:13px;margin:0;padding:0}
      table{width:100%;border-collapse:collapse}
      td{padding:2px}
      .line{border-top:1px solid #000;margin:6px 0}
      .conditions{font-size:12px;white-space:pre-wrap;line-height:1.4}
       .row {
          display: flex;
          justify-content: space-between;
        }
      </style></head><body>
      <div style="text-align:center;font-weight:bold">MUTHU MOBILES</div>
      <div style="text-align:center">Uranipuram</div>
      <div style="text-align:center">Mob:9791611603,9363230745</div>
      <div class="line"></div>
       <div class="row">
          <div><b>Bill No:</b> ${billNo}</div>
          <div><b>Date:</b> ${date}</div>
        </div>
        <div class="row">
          <div><b>Customer:</b> ${customerName}</div>
          <div><b>Mobile No:</b> ${mobileNumber}</div>
        </div>
      <div class="line"></div>
      <table><tr><td><b>S.No</b></td><td><b>Item</b></td><td><b>Rate</b></td><td><b>Qty</b></td><td><b>Amt</b></td></tr>
      ${items
        .map(
          (i, index) =>
            `<tr><td>${index + 1}</td><td>${i.productName}</td><td>${Number(i.rate).toFixed(2)}</td><td>${
              i.quantity
            }</td><td>${Number(i.amount).toFixed(2)}</td></tr>`
        )
        .join("")}
      </table>
      <div class="line"></div>
      <div style="text-align:right">Total: ₹${Number(total).toFixed(2)}</div>
      <div style="text-align:right">Discount: ₹${Number(discount || 0).toFixed(2)}</div>
      <div style="text-align:right;font-weight:bold">Net: ₹${Number(billTotal).toFixed(2)}</div>
      <div class="line"></div>
      <div class="conditions">
        <b>நிபந்தனைகள்:</b><br>
        ❖ Sim Card, Memory Card, Battery போன்ற வாடிக்கையாளர்களின் சொந்த பொருட்களை கவனமாக கொண்டு செல்ல வேண்டும்.<br><br>
        ❖ தவறான கொடுத்தவுடன் மீண்டும் சென்றுவிட்டால் எந்தவொரு நிலுவை பணமும் திருப்பி வழங்கப்படமாட்டாது.<br>
        &nbsp;&nbsp;சரிசெய்து கொடுக்க முடியாதபட்சத்தில் பட்டணங்களுக்கு அனுப்பி சரிசெய்யப்படும்.<br>
        &nbsp;&nbsp;காலநிலையால் செல்போன் சிக்கல் ஏற்பட்டால் பொறுப்பேற்க முடியாது.<br><br>
        ❖ மாறிய பொருள்களுக்கு மற்றும் தாமதமான பணியாளர்களுக்கு சிறிய தாமதம் ஏற்படலாம்.<br><br>
        ❖ பில் கொடுத்த பிறகே மட்டும் செல்போன் திரும்பப் பெறப்படும்.<br><br>
        ❖ Display, No Network IC, Touch Problem, Water Problem – <b>NO WARRANTY, NO CARENTY</b><br><br>
        <div><b>Customer Signature</b> ________________________ 
        <span style="float:right;">For. Muthu Mobiles</span></div>
      </div>
      <div class="line"></div>
      <div style="text-align:center">Thank you! Visit Again</div>
      </body></html>
    `;
    const w = window.open("", "PRINT", "height=600,width=800");
    w.document.write(html);
    w.document.close();
    w.print();
    w.close();
  };

  return (
    <Box p={6} minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} pb="120px">
      <Flex justify="space-between" align="center" mb={8}>
        <Text fontSize="2xl" fontWeight="bold" color={headerColor}>
          Create Invoice
        </Text>
      </Flex>

      {/* Unified Input Row */}
      <Card p={3} mb={4} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Flex align="center" gap={3} flexWrap="wrap">
          {/* Product Search */}
          <Box position="relative" w={{ base: "100%", md: "300px" }}>
            <Input
              placeholder="Search or select product..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              size="sm"
              bg="white"
            />
            {isOpen && (
              <Box
                position="absolute"
                top="100%"
                left="0"
                w="100%"
                bg="white"
                border="1px solid"
                borderColor={borderColor}
                mt="2"
                borderRadius="md"
                boxShadow="xl"
                zIndex={10}
                maxH="180px"
                overflowY="auto"
              >
                {isLoading ? (
                  <Flex align="center" justify="center" p={3}>
                    <Spinner size="sm" mr={2} /> <Text>Loading...</Text>
                  </Flex>
                ) : filteredList.length > 0 ? (
                  filteredList.map((p) => (
                    <Flex
                      key={p.productId}
                      px={3}
                      py={1}
                      align="center"
                      justify="space-between"
                      _hover={{ bg: "blue.50" }}
                      cursor="pointer"
                      onMouseDown={() => handleSelectProduct(p)}
                    >
                      <Text fontSize="sm" fontWeight="500">
                        {p.productName}
                      </Text>
                      <Text fontSize="sm" color="blue.500">
                        ₹{Number(p.rate).toFixed(2)}
                      </Text>
                    </Flex>
                  ))
                ) : (
                  <Text textAlign="center" p={3} color="gray.500" fontSize="sm">
                    No matching products
                  </Text>
                )}
              </Box>
            )}
          </Box>

          {/* Qty + Add Button */}
          <Input
            w="80px"
            size="sm"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            size="sm"
            onClick={handleAddProduct}
            isDisabled={!selectedProduct}
          >
            Add
          </Button>

          {/* Customer Info */}
          <Input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            size="sm"
            w={{ base: "100%", md: "180px" }}
          />
          <Input
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            size="sm"
            type="number"
            w={{ base: "100%", md: "160px" }}
          />
          <Input placeholder="Invoice No" value={invoiceNo} isReadOnly size="sm" w={{ base: "100%", md: "100px" }} />
          <Button
            color="white"
            size="sm"
            bgColor={"blue.600"}
            variant="outline"
            onClick={() => {
              setCustomerName("");
              setMobileNumber("");
              setRows([]);
            }}
          >
            New Invoice
          </Button>
        </Flex>
      </Card>

      {/* Table Section */}
      <Card bg={tableBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Table size="sm">
          <Thead bg={useColorModeValue("blue.50", "blue.900")}>
            <Tr>
              <Th>Product</Th>
              <Th isNumeric>Rate</Th>
              <Th isNumeric>Qty</Th>
              <Th isNumeric>Amount</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row, i) => (
              <Tr key={i}>
                <Td>{row.productName}</Td>
                <Td isNumeric>{Number(row.rate).toFixed(2)}</Td>
                <Td isNumeric>{row.quantity}</Td>
                <Td isNumeric>{Number(row.amount).toFixed(2)}</Td>
                <Td>
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleRemove(row.productId)}
                    aria-label="Remove"
                  />
                </Td>
              </Tr>
            ))}
            {rows.length === 0 && (
              <Tr>
                <Td colSpan="5" textAlign="center" color="gray.500">
                  No products added
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Card>

      {/* Sticky Footer */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        w="100%"
        bg={useColorModeValue("gray.100", "gray.800")}
        py={3}
        px={6}
        borderTop="1px solid"
        borderColor={borderColor}
        zIndex={100}
      >
        <Flex justify="flex-end" align="center" gap={4} wrap="wrap">
          <Box bg="white" px={6} py={3} borderRadius="md" shadow="sm">
            <Text fontWeight="bold" color="blue.600">
              Total: ₹{Number(totalAmount).toFixed(2)}
            </Text>
          </Box>
          <Box bg="white" px={6} py={3} borderRadius="md" shadow="sm">
            <Flex align="center" gap={2}>
              <Text fontWeight="bold" color="orange.500">
                Discount:
              </Text>
              <Input size="sm" w="80px" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </Flex>
          </Box>
          <Box bg="white" px={6} py={3} borderRadius="md" shadow="sm">
            <Text fontWeight="bold" color="green.600">
              Net: ₹{Number(netAmount).toFixed(2)}
            </Text>
          </Box>
          <Button colorScheme="blue" onClick={handleSave} size="md" isDisabled={rows.length === 0}>
            Print Invoice
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Invoice;
