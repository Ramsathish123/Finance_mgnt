import React, { useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Progress,
  useColorModeValue,
  Badge,
  Avatar,
  AvatarGroup,
} from "@chakra-ui/react";
import { Bar, Pie } from "react-chartjs-2";
import { useState } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import { FiTrendingUp, FiSmartphone, FiDollarSign, FiPackage } from "react-icons/fi";
import { motion } from "framer-motion";
import axios from "axios";

// Register ChartJS components
ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const MotionCard = motion(Card);

export default function Dashboard() {
  const cardBg = useColorModeValue("white", "gray.700");
  const headerColor = useColorModeValue("blue.600", "blue.300");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  });
  const [stockData, setStockData] = useState({
    labels: [],
    datasets: [],
  });
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const response = await axios.get("http://localhost:9988/monthly_sales_chart");

        const months = response.data.map((item) => item.month);
        const totals = response.data.map((item) => item.totalSales);

        setSalesData({
          labels: months,
          datasets: [
            {
              label: "Sales (₹)",
              data: totals,
              backgroundColor: [
                "#3182CE",
                "#4299E1",
                "#63B3ED",
                "#90CDF4",
                "#A0AEC0",
                "#BEE3F8",
                "#CBD5E0",
                "#EDF2F7",
                "#E2E8F0",
                "#2B6CB0",
                "#2C5282",
                "#2A4365",
              ],
              borderColor: "#2C5282",
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching monthly sales chart:", error);
      }
    };

    fetchMonthlySales();
  }, []);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        const response = await axios.get("http://localhost:9988/top-selling-products");
        const data = response.data;

        // Map data to include a color and normalize sales for progress bar
        const maxSales = Math.max(...data.map((item) => item.sold_count), 1);
        const colors = ["blue", "green", "purple", "orange", "red"];

        const formatted = data.map((item, index) => ({
          name: item.product_name,
          sales: item.sold_count,
          normalizedSales: (item.sold_count / maxSales) * 100,
          color: colors[index % colors.length],
        }));

        setTopSellers(formatted);
      } catch (error) {
        console.error("Error fetching top sellers:", error);
      }
    };

    fetchTopSellers();
  }, []);

  useEffect(() => {
    const fetchMonthlyService = async () => {
      try {
        const response = await axios.get("http://localhost:9988/monthly_service_chart");

        const months = response.data.map((item) => item.month);
        const totals = response.data.map((item) => item.totalSales);

        setStockData({
          labels: months,
          datasets: [
            {
              label: "Sales (₹)",
              data: totals,
              backgroundColor: [
                "#3182CE",
                "#4299E1",
                "#63B3ED",
                "#90CDF4",
                "#A0AEC0",
                "#BEE3F8",
                "#CBD5E0",
                "#EDF2F7",
                "#E2E8F0",
                "#2B6CB0",
                "#2C5282",
                "#2A4365",
              ],
              borderColor: "#2C5282",
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching monthly sales chart:", error);
      }
    };

    fetchMonthlyService();
  }, []);

  const fetchSummary = async () => {
    // setLoading(true);
    try {
      const response = await axios.get("http://localhost:9988/sale_service_summary");
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch summary:", error.response?.data || error.message);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
      <Flex justify="space-between" align="center" mb={8}>
        <Text fontSize="2xl" fontWeight="bold" color={headerColor}>
          📱Shop Analytics
        </Text>
        <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
          Live Data
        </Badge>
      </Flex>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <MotionCard bg={cardBg} borderRadius="xl" boxShadow="lg" whileHover={{ y: -5 }}>
          <CardBody>
            <Flex align="center">
              <Box p={3} bg="blue.100" borderRadius="full" mr={4}>
                <Icon as={FiDollarSign} w={6} h={6} color="blue.600" />
              </Box>
              <Stat>
                <StatLabel color="gray.500">Total Sales</StatLabel>
                <StatNumber>{summary?.todayInvoiceSale ?? 0}</StatNumber>
                {/* <StatHelpText>
                  <StatArrow type="increase" color="green.500" />
                  <Text as="span" color="green.500">12.5%</Text> Today
                </StatHelpText> */}
              </Stat>
            </Flex>
          </CardBody>
        </MotionCard>

        <MotionCard bg={cardBg} borderRadius="xl" boxShadow="lg" whileHover={{ y: -5 }}>
          <CardBody>
            <Flex align="center">
              <Box p={3} bg="green.100" borderRadius="full" mr={4}>
                <Icon as={FiSmartphone} w={6} h={6} color="green.600" />
              </Box>
              <Stat>
                <StatLabel color="gray.500">Total Services</StatLabel>
                <StatNumber>{summary?.todayDeliveredCost ?? 0}</StatNumber>
                {/* <StatHelpText>
                  <StatArrow type="increase" color="green.500" />
                  <Text as="span" color="green.500">8%</Text>Today
                </StatHelpText> */}
              </Stat>
            </Flex>
          </CardBody>
        </MotionCard>

        <MotionCard bg={cardBg} borderRadius="xl" boxShadow="lg" whileHover={{ y: -5 }}>
          <CardBody>
            <Flex align="center">
              <Box p={3} bg="purple.100" borderRadius="full" mr={4}>
                <Icon as={FiTrendingUp} w={6} h={6} color="purple.600" />
              </Box>
              <Stat>
                <StatLabel color="gray.500">Sales Monthly</StatLabel>
                <StatNumber>{summary?.monthlyInvoiceSale ?? 0}</StatNumber>
                {/* <StatHelpText>
                  <Text as="span" color="blue.500">35%</Text> of total sales
                </StatHelpText> */}
              </Stat>
            </Flex>
          </CardBody>
        </MotionCard>

        <MotionCard bg={cardBg} borderRadius="xl" boxShadow="lg" whileHover={{ y: -5 }}>
          <CardBody>
            <Flex align="center">
              <Box p={3} bg="orange.100" borderRadius="full" mr={4}>
                <Icon as={FiPackage} w={6} h={6} color="orange.600" />
              </Box>
              <Stat>
                <StatLabel color="gray.500">Service Monthly</StatLabel>
                <StatNumber>{summary?.monthlyServiceSale ?? 0}</StatNumber>
                {/* <StatHelpText>
                  <Progress value={82} size="xs" colorScheme="orange" mt={2} borderRadius="full" />
                </StatHelpText> */}
              </Stat>
            </Flex>
          </CardBody>
        </MotionCard>
      </SimpleGrid>

      {/* Charts Section */}
      <Flex direction={{ base: "column", lg: "row" }} gap={6} mb={8}>
        {/* Sales Bar Chart */}
        <MotionCard flex={1} bg={cardBg} borderRadius="xl" boxShadow="lg" whileHover={{ scale: 1.01 }}>
          <CardHeader borderBottom="1px" borderColor="gray.100">
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="semibold">
                Monthly Sales Performance
              </Text>
              {/* <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                ₹7.0L in Jul
              </Badge> */}
            </Flex>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Bar
                data={salesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: useColorModeValue("rgba(0,0,0,0.1)", "rgba(255,255,255,0.1)"),
                      },
                      ticks: {
                        callback: function (value) {
                          return "₹" + value / 1000 + "k";
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return "Sales: ₹" + context.raw.toLocaleString("en-IN");
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          </CardBody>
        </MotionCard>

        {/* Stock Pie Chart */}
        <MotionCard flex={1} bg={cardBg} borderRadius="xl" boxShadow="lg" whileHover={{ scale: 1.01 }}>
          <CardHeader borderBottom="1px" borderColor="gray.100">
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="semibold">
                Service Performance
              </Text>
              {/* <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                420 Units
              </Badge> */}
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex direction={{ base: "column", md: "row" }} align="center">
              <Box w={{ base: "100%", md: "60%" }} h="250px">
                <Pie
                  data={stockData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false, // Hide the legend above the pie chart
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} units (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </Box>
              <Box w={{ base: "100%", md: "40%" }} mt={{ base: 4, md: 0 }}>
                {stockData.labels.map((brand, index) => (
                  <Flex key={brand} align="center" mb={3}>
                    <Box w="12px" h="12px" borderRadius="sm" bg={stockData.datasets[0].backgroundColor[index]} mr={3} />
                    <Text flex={1} fontSize="sm">
                      {brand}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {stockData.datasets[0].data[index]} ₹ RS
                    </Text>
                  </Flex>
                ))}
              </Box>
            </Flex>
          </CardBody>
        </MotionCard>
      </Flex>

      {/* Bottom Section */}
      <Flex direction={{ base: "column", lg: "row" }} gap={6}>
        {/* Top Sellers */}
        <MotionCard
          w={{ base: "100%", lg: "100%" }}
          bg={cardBg}
          borderRadius="xl"
          boxShadow="lg"
          whileHover={{ scale: 1.01 }}
        >
          <CardHeader borderBottom="1px" borderColor="gray.100">
            <Text fontSize="lg" fontWeight="semibold">
              🔥 Top Selling Models
            </Text>
          </CardHeader>
          <CardBody>
            {topSellers.map((item, index) => (
              <Box key={index} mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontWeight="medium">{item.name}</Text>
                  <Text fontWeight="bold">{item.sales} sold</Text>
                </Flex>
                <Progress value={item.sales} max={100} size="sm" colorScheme={item.color} borderRadius="full" />
              </Box>
            ))}
          </CardBody>
        </MotionCard>

        {/* Recent Activity */}
        {/* <MotionCard 
          flex={1} 
          bg={cardBg} 
          borderRadius="xl" 
          boxShadow="lg"
          whileHover={{ scale: 1.01 }}
        >
          <CardHeader borderBottom="1px" borderColor="gray.100">
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="semibold">Recent Activity</Text>
              <AvatarGroup size="sm" max={3}>
                <Avatar name="John Doe" src="https://bit.ly/dan-abramov" />
                <Avatar name="Jane Smith" src="https://bit.ly/kent-c-dodds" />
                <Avatar name="Mike Ross" src="https://bit.ly/ryan-florence" />
              </AvatarGroup>
            </Flex>
          </CardHeader>
          <CardBody>
            {[
              { action: 'Sold 5 iPhone 14 Pro', time: '2 hours ago', icon: '💰', color: 'green' },
              { action: 'Received Samsung S23 shipment', time: '5 hours ago', icon: '📦', color: 'blue' },
              { action: 'Monthly target achieved (105%)', time: '1 day ago', icon: '🎯', color: 'purple' },
              { action: 'Xiaomi Redmi Note 12 out of stock', time: '2 days ago', icon: '⚠️', color: 'red' },
              { action: 'New Oppo Reno 8 display setup', time: '3 days ago', icon: '🆕', color: 'teal' }
            ].map((item, index) => (
              <Flex key={index} mb={4} align="start">
                <Box fontSize="xl" mr={3}>{item.icon}</Box>
                <Box flex={1}>
                  <Text fontWeight="medium">{item.action}</Text>
                  <Text fontSize="sm" color="gray.500">{item.time}</Text>
                </Box>
                <Badge colorScheme={item.color} variant="subtle" fontSize="xs">
                  {item.color === 'red' ? 'Urgent' : 'Update'}
                </Badge>
              </Flex>
            ))}
          </CardBody>
        </MotionCard> */}
      </Flex>
    </Box>
  );
}
