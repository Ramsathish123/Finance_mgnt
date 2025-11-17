// src/pages/dashboard/dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
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
  Icon,
} from "@chakra-ui/react";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  FiDollarSign,
  FiSmartphone,
  FiTrendingUp,
  FiPackage,
} from "react-icons/fi";
import { motion } from "framer-motion";
import axios from "axios";

import "../../index.css";
import "../../App.css";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const MotionCard = motion(Card);

/**
 * Utility: read CSS variable from :root with fallback
 */
function getCssVar(name, fallback) {
  try {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return val || fallback;
  } catch {
    return fallback;
  }
}

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [salesData, setSalesData] = useState({ labels: [], datasets: [] });
  const [serviceData, setServiceData] = useState({ labels: [], datasets: [] });
  const [topSellers, setTopSellers] = useState([]);

  // Build theme chart color palette at runtime from CSS variables
  const themeChartColors = useMemo(() => {
    return [
      getCssVar("--chart-purple", "#625df0"),
      getCssVar("--chart-blue", "#3182CE"),
      getCssVar("--chart-green", "#2EB872"),
      getCssVar("--chart-orange", "#FF7A3D"),
      getCssVar("--chart-yellow", "#F4B400"),
      getCssVar("--chart-red", "#E53E3E"),
      getCssVar("--chart-teal", "#23B5D3"),
    ];
  }, []);

  // fetch summary
  useEffect(() => {
    let mounted = true;
    axios
      .get("http://localhost:9988/sale_service_summary")
      .then((res) => {
        if (!mounted) return;
        setSummary(res.data || {});
      })
      .catch((err) => {
        console.error("summary fetch error", err);
      });
    return () => (mounted = false);
  }, []);

  // fetch monthly sales and prepare bar colors
  useEffect(() => {
    let mounted = true;
    axios
      .get("http://localhost:9988/monthly_sales_chart")
      .then((res) => {
        if (!mounted) return;
        const data = res.data || [];
        const labels = data.map((d) => d.month || "");
        const values = data.map((d) => Number(d.totalSales || 0));
        // cycle themeChartColors to match data length
        const bg = labels.map(
          (_, i) => themeChartColors[i % themeChartColors.length]
        );
        setSalesData({
          labels,
          datasets: [
            {
              label: "Sales (₹)",
              data: values,
              backgroundColor: bg,
              borderRadius: 6,
            },
          ],
        });
      })
      .catch((err) => {
        console.error("sales chart fetch error", err);
      });

    return () => (mounted = false);
  }, [themeChartColors]);

  // fetch monthly service (pie)
  useEffect(() => {
    let mounted = true;
    axios
      .get("http://localhost:9988/monthly_service_chart")
      .then((res) => {
        if (!mounted) return;
        const data = res.data || [];
        const labels = data.map((d) => d.month || "");
        const values = data.map((d) => Number(d.totalSales || 0));
        const bg = labels.map(
          (_, i) => themeChartColors[i % themeChartColors.length]
        );
        setServiceData({
          labels,
          datasets: [
            {
              label: "Service",
              data: values,
              backgroundColor: bg,
              borderColor: "transparent",
            },
          ],
        });
      })
      .catch((err) => {
        console.error("service chart fetch error", err);
      });

    return () => (mounted = false);
  }, [themeChartColors]);

  // top sellers
  useEffect(() => {
    let mounted = true;
    axios
      .get("http://localhost:9988/top-selling-products")
      .then((res) => {
        if (!mounted) return;
        const data = res.data || [];
        // normalize and assign color classes in a round-robin fashion
        const colorClasses = [
          "progress-purple",
          "progress-blue",
          "progress-green",
          "progress-orange",
          "progress-yellow",
        ];
        const maxSold = Math.max(
          ...data.map((d) => Number(d.sold_count || 0)),
          1
        );
        const formatted = data.map((d, i) => ({
          name: d.product_name,
          sales: Number(d.sold_count || 0),
          pct: Math.round((Number(d.sold_count || 0) / maxSold) * 100 || 0),
          colorClass: colorClasses[i % colorClasses.length],
        }));
        setTopSellers(formatted);
      })
      .catch((err) => {
        console.error("top sellers fetch error", err);
      });

    return () => (mounted = false);
  }, []);

  // Chart common options (colors for axes and grid using CSS vars)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index" },
    },
    scales: {
      x: {
        ticks: {
          color: getCssVar("--color-text", "#1e293b"),
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: getCssVar("--color-text", "#1e293b"),
          callback: (value) =>
            "₹" + (value >= 1000 ? value / 1000 + "k" : value),
        },
        grid: {
          color: getCssVar("--grid-color", "rgba(0,0,0,0.06)"),
        },
      },
    },
  };

  return (
    <Box overflow="hidden">
      {/* header with left accent — choice C */}
      <Flex className="page-header">
        <Text className="page-title">Shop Analytics</Text>
      </Flex>

      {/* stat cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <MotionCard className="stat-card" whileHover={{ y: -6 }}>
          <CardBody className="stat-card-body">
            <Box className="stat-icon icon-purple">
              <Icon as={FiDollarSign} />
            </Box>
            <Stat>
              <StatLabel className="stat-label">Total Sales Today</StatLabel>
              <StatNumber className="stat-value">
                ₹{summary?.todayInvoiceSale ?? 0}
              </StatNumber>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard className="stat-card" whileHover={{ y: -6 }}>
          <CardBody className="stat-card-body">
            <Box className="stat-icon icon-blue">
              <Icon as={FiSmartphone} />
            </Box>
            <Stat>
              <StatLabel className="stat-label">Total Services Today</StatLabel>
              <StatNumber className="stat-value">
                ₹{summary?.todayDeliveredCost ?? 0}
              </StatNumber>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard className="stat-card" whileHover={{ y: -6 }}>
          <CardBody className="stat-card-body">
            <Box className="stat-icon icon-green">
              <Icon as={FiTrendingUp} />
            </Box>
            <Stat>
              <StatLabel className="stat-label">Sales Monthly</StatLabel>
              <StatNumber className="stat-value">
                ₹{summary?.monthlyInvoiceSale ?? 0}
              </StatNumber>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard className="stat-card" whileHover={{ y: -6 }}>
          <CardBody className="stat-card-body">
            <Box className="stat-icon icon-orange">
              <Icon as={FiPackage} />
            </Box>
            <Stat>
              <StatLabel className="stat-label">Service Monthly</StatLabel>
              <StatNumber className="stat-value">
                ₹{summary?.monthlyServiceSale ?? 0}
              </StatNumber>
            </Stat>
          </CardBody>
        </MotionCard>
      </SimpleGrid>

      {/* charts */}
      <Flex direction={{ base: "column", lg: "row" }} gap={6} mb={8}>
        <MotionCard
          className="chart-card"
          whileHover={{ scale: 1.01 }}
          flex="1"
        >
          <CardHeader className="chart-header">
            <Text className="chart-title">Monthly Sales Performance</Text>
          </CardHeader>
          <CardBody>
            <Box className="chart-box">
              <Bar data={salesData} options={chartOptions} />
            </Box>
          </CardBody>
        </MotionCard>

        <MotionCard
          className="chart-card"
          whileHover={{ scale: 1.01 }}
          flex="1"
        >
          <CardHeader className="chart-header">
            <Text className="chart-title">Service Performance</Text>
          </CardHeader>
          <CardBody>
            <Flex direction={{ base: "column", md: "row" }}>
              <Box className="pie-wrapper">
                <Pie
                  data={serviceData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </Box>

              <Box className="pie-legend">
                {serviceData.labels &&
                  serviceData.labels.map((l, i) => (
                    <Flex key={i} className="pie-legend-row">
                      <span
                        className="pie-color-box"
                        style={{
                          backgroundColor:
                            serviceData.datasets?.[0]?.backgroundColor?.[i] ||
                            themeChartColors[i % themeChartColors.length],
                        }}
                      />
                      <Text className="pie-label">{l}</Text>
                    </Flex>
                  ))}
              </Box>
            </Flex>
          </CardBody>
        </MotionCard>
      </Flex>

      {/* top sellers */}
      <MotionCard className="chart-card" whileHover={{ scale: 1.01 }}>
        <CardHeader className="chart-header">
          <Text className="chart-title">Top Selling Models</Text>
        </CardHeader>
        <CardBody>
          {topSellers.length === 0 ? (
            <Text className="stat-label">No top sellers found.</Text>
          ) : (
            topSellers.map((s, idx) => (
              <Box key={idx} className="top-seller" mb={4}>
                <Flex className="top-seller-row">
                  <Text className="top-seller-name">{s.name}</Text>
                  <Text className="top-seller-count"> {s.sales} sold</Text>
                </Flex>

                <div className={`progress-track ${s.colorClass}`}>
                  <div
                    className="progress-fill"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </Box>
            ))
          )}
        </CardBody>
      </MotionCard>
    </Box>
  );
}
