import React, { Fragment, useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Box,
  Button,
  Collapse,
  IconButton,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import Layout from '@/component/Layout';
import { getCookie } from '@/utils/cookie';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function ShowOrder() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterMonthYearStart, setFilterMonthYearStart] = useState<string>('');
  const [filterMonthYearEnd, setFilterMonthYearEnd] = useState<string>('');
  const token = getCookie('token');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, {
          headers: { /*'Authorization': `Bearer ${token}`*/ },
        });
        const data = await res.json();

        if (res.ok && data.status === 'success') {
          setOrders(data.data);
          const uniqueUsers = Array.from(
            new Map(data.data.map((order: any) => [order.user.id, order.user])).values()
          );
          setUsers(uniqueUsers);
        } else {
          console.error('Failed to fetch orders:', data.message);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Filter orders based on user, date range, and month-year range
  const filteredOrders = orders.filter((order) => {
    const matchesUser = filterUser ? order.user.id === filterUser : true;
    const createdAt = new Date(order.createdAt);
    const orderDate = createdAt.toISOString().split('T')[0];
    const matchesDateRange =
      (filterStartDate ? orderDate >= filterStartDate : true) &&
      (filterEndDate ? orderDate <= filterEndDate : true);

    const orderMonthYear = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    const matchesMonthYearRange =
      (filterMonthYearStart ? orderMonthYear >= filterMonthYearStart : true) &&
      (filterMonthYearEnd ? orderMonthYear <= filterMonthYearEnd : true);

    return matchesUser && matchesDateRange && matchesMonthYearRange;
  });

  // Sum total of all orders
  const totalSum = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  // Toggle expanded row
  const handleToggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Function to clear all filters
  const handleClearFilters = () => {
    setFilterUser('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterMonthYearStart('');
    setFilterMonthYearEnd('');
  };

  // Export orders as PDF
  // Export orders as PDF
  const handleExportExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create an array to hold the data for the excel sheet
    const sheetData: any[] = [];
    
    // Header for the orders sheet
    sheetData.push([
      "Order ID", "User", "Total", "Status", "Created At", "Product Name", "Quantity", "Price", "Subtotal"
    ]);
  
    // Add data for each order
    filteredOrders.forEach((order) => {
      // For each order, add a row for each item
      order.items.forEach((item : any) => {
        sheetData.push([
          order.id,
          `${order.user.fname} ${order.user.lname}`,
          order.total.toFixed(2),
          order.status,
          new Date(order.createdAt).toLocaleString(),
          item.product.name,
          item.quantity,
          item.price.toFixed(2),
          (item.quantity * item.price).toFixed(2),
        ]);
      });
    });
  
    // Convert the data to a worksheet
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
  
    // Generate the Excel file and trigger download
    const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelFile], { type: "application/octet-stream" }), "Order_Report.xlsx");
  };


  if (loading) {
    return (
      <Layout>
        <Typography>Loading...</Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6">Orders</Typography>
      </Box>

      {/* Filter Section */}
      <Box sx={{ display: 'flex', gap: 3, marginBottom: 3 }}>
        {/* User Filter */}
        <FormControl fullWidth>
          <InputLabel>User</InputLabel>
          <Select
            value={filterUser}
            label="User"
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <MenuItem value="">All Users</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.fname} {user.lname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Start Date Filter */}
        <TextField
          label="Start Date"
          type="date"
          variant="outlined"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          fullWidth
        />

        {/* End Date Filter */}
        <TextField
          label="End Date"
          type="date"
          variant="outlined"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          fullWidth
        />

        {/* Start Month-Year Filter */}
        <TextField
          label="Start Month-Year"
          type="month"
          variant="outlined"
          value={filterMonthYearStart}
          onChange={(e) => setFilterMonthYearStart(e.target.value)}
          fullWidth
        />

        {/* End Month-Year Filter */}
        <TextField
          label="End Month-Year"
          type="month"
          variant="outlined"
          value={filterMonthYearEnd}
          onChange={(e) => setFilterMonthYearEnd(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Clear Filters Button */}
      <Box sx={{ marginBottom: 3 }}>
        <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
          Clear Filters
        </Button>

        
        

        <Button variant="contained" color="primary" onClick={handleExportExcel}>
          Export Report
        </Button>
      </Box>

      <div id="report-section">
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow>
                    <TableCell>
                      <IconButton onClick={() => handleToggleExpand(order.id)}>
                        {expandedOrderId === order.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      {order.user.fname} {order.user.lname}
                    </TableCell>
                    <TableCell>{order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedOrderId === order.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            Order Items
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Subtotal</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.items.map((item : any) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.product.name}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{item.price.toFixed(2)}</TableCell>
                                  <TableCell>{(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
            <TableRow>
              <TableCell colSpan={3} align="right">
                <strong>Total:</strong>
              </TableCell>
              <TableCell colSpan={3}>
                <strong>฿{totalSum.toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          </Table>
        </Paper>
      </div>
    </Layout>
  );
}
