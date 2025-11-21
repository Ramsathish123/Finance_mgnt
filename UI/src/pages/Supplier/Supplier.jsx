import React, { useState, useEffect } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Stack,
  Card,
  useToast,
  Tooltip,
  Spinner,
  Text,
  HStack,
} from "@chakra-ui/react";

import { FiTrash, FiPlus, FiEye } from "react-icons/fi";
import axios from "axios";

const Supplier = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [suppliers, setSuppliers] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [isViewOpen, setViewOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    supplier_name: "",
    mobile: "",
    address: "",
    gst_number: "",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const toast = useToast();

  useEffect(() => {
    fetchSuppliers(page);
  }, [page]);

  const fetchSuppliers = async (p) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/supplier?page=${p}&limit=10`
      );
      setSuppliers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(false);
    setEditingId(null);
    setForm({
      supplier_name: "",
      mobile: "",
      address: "",
      gst_number: "",
    });
    onOpen();
  };

  const openEdit = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/supplier/${id}`
      );
      setForm({
        supplier_name: res.data.supplier_name,
        mobile: res.data.mobile || "",
        address: res.data.address || "",
        gst_number: res.data.gst_number || "",
      });
      setEditing(true);
      setEditingId(id);
      onOpen();
    } catch {
      toast({
        title: "Error",
        status: "error",
        description: "Failed to fetch supplier",
      });
    }
  };

  const openView = (supplier) => {
    setViewSupplier(supplier);
    setViewOpen(true);
  };

  const saveSupplier = async () => {
    if (!form.supplier_name.trim()) {
      toast({
        title: "Required",
        description: "Supplier name is required",
        status: "warning",
      });
      return;
    }

    try {
      if (isEditing) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/supplier/${editingId}`,
          form
        );
        toast({ title: "Updated", status: "success" });
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/supplier`, form);
        toast({ title: "Added", status: "success" });
      }

      onClose();
      fetchSuppliers(page);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed",
        status: "error",
      });
    }
  };

  const deleteSupplier = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/supplier/${deleteId}`
      );
      toast({ title: "Deleted", status: "success" });
      setDeleteOpen(false);
      fetchSuppliers(page);
    } catch {
      toast({
        title: "Error",
        status: "error",
        description: "Failed to delete",
      });
    }
  };

  return (
    <>
      {loading && (
        <Box className="loading-overlay">
          <Spinner size="xl" color="#625DF0" thickness="4px" />
          <Text className="loading-text">Retrieving suppliers...</Text>
        </Box>
      )}

      <Box overflow="hidden">
        {/* HEADER */}
        <Flex className="page-header">
          <Text className="page-title">Supplier Details</Text>
          <Button
            className="btn-primary"
            size="sm"
            leftIcon={<FiPlus />}
            onClick={openAdd}
          >
            Add Supplier
          </Button>
        </Flex>

        {/* TABLE */}
        <Card className="table-card">
          <Box className="table-scroll">
            <Table className="table" size="sm">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>Mobile</Th>
                  <Th>GST</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {suppliers.map((s) => (
                  <Tr key={s.supplier_id}>
                    <Td
                    //   onClick={() => openEdit(s.supplier_id)}
                    //   className="clickable-id"
                    >
                      {s.supplier_id}
                    </Td>
                    <Td>{s.supplier_name}</Td>
                    <Td>{s.mobile || "-"}</Td>
                    <Td>{s.gst_number || "-"}</Td>
                    <Td>
                      <Flex gap="6px">
                        <Tooltip label="View Details">
                          <IconButton
                            icon={<FiEye />}
                            size="xs"
                            className="table-action-btn view"
                            onClick={() => openView(s)}
                          />
                        </Tooltip>

                        <Tooltip label="Delete">
                          <IconButton
                            icon={<FiTrash />}
                            size="xs"
                            className="table-action-btn delete"
                            onClick={() => {
                              setDeleteId(s.supplier_id);
                              setDeleteOpen(true);
                            }}
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* PAGINATION */}
          <Flex className="pagination-footer">
            <Text className="pagination-text">
              Showing {suppliers.length} items
            </Text>
            <HStack spacing={2}>
              <Button
                size="xs"
                className="pagination-btn"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                isDisabled={page === 1}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="xs"
                  className={`pagination-btn ${page === i + 1 ? "active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                size="xs"
                className="pagination-btn"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                isDisabled={page === totalPages}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </Card>

        {/* ADD/EDIT MODAL */}
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent className="modal-box">
            <ModalHeader className="modal-header">
              {isEditing ? "Edit Supplier" : "Add Supplier"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody className="modal-body">
              <Stack spacing={3} className="modal-form">
                <FormControl>
                  <FormLabel>Supplier Name</FormLabel>
                  <Input
                    value={form.supplier_name}
                    onChange={(e) =>
                      setForm({ ...form, supplier_name: e.target.value })
                    }
                    placeholder="Enter supplier name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Mobile</FormLabel>
                  <Input
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                    placeholder="Enter mobile"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="Enter address"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>GST Number</FormLabel>
                  <Input
                    value={form.gst_number}
                    onChange={(e) =>
                      setForm({ ...form, gst_number: e.target.value })
                    }
                    placeholder="Enter GST"
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
              <Button className="btn-primary" size="sm" onClick={saveSupplier}>
                {isEditing ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* DELETE MODAL */}
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setDeleteOpen(false)}
          isCentered
        >
          <ModalOverlay />
          <ModalContent className="modal-box">
            <ModalHeader className="modal-header">Confirm Delete</ModalHeader>
            <ModalCloseButton />
            <ModalBody className="modal-body">
              <Text>Are you sure you want to delete this supplier?</Text>
            </ModalBody>
            <ModalFooter className="modal-footer">
              <Button
                className="btn-cancel"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button className="btn-danger" size="sm" onClick={deleteSupplier}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* VIEW DETAILS MODAL */}
        <Modal
          isOpen={isViewOpen}
          onClose={() => setViewOpen(false)}
          size="md"
          isCentered
        >
          <ModalOverlay />
          <ModalContent className="modal-box">
            <ModalHeader className="modal-header">Supplier Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody className="modal-body">
              {viewSupplier && (
                <Box>
                  <Text fontWeight="600">Name:</Text>
                  <Text mb={2}>{viewSupplier.supplier_name}</Text>

                  <Text fontWeight="600">Mobile:</Text>
                  <Text mb={2}>{viewSupplier.mobile || "-"}</Text>

                  <Text fontWeight="600">Address:</Text>
                  <Text mb={2}>{viewSupplier.address || "-"}</Text>

                  <Text fontWeight="600">GST:</Text>
                  <Text mb={2}>{viewSupplier.gst_number || "-"}</Text>

                  <Text fontWeight="600">Created:</Text>
                  <Text mb={2}>
                    {new Date(viewSupplier.created_at).toLocaleString()}
                  </Text>

                  <Text fontWeight="600">Updated:</Text>
                  <Text>
                    {new Date(viewSupplier.updated_at).toLocaleString()}
                  </Text>
                </Box>
              )}
            </ModalBody>
            <ModalFooter className="modal-footer">
              <Button
                className="btn-primary"
                size="sm"
                onClick={() => setViewOpen(false)}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default Supplier;
