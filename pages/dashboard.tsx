import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Grid, Paper, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Layout from '@/component/Layout';
import { GetServerSideProps } from 'next';
import type { User } from '../models/user';
import { setCookie, getCookie, deleteCookie } from '@/utils/cookie';
import apiProxy from '@/utils/apiProxy';

interface DashboardProps {
  userAll?: { users: User[] };
}
interface ProductReport {
  id: string;
  product: Product;
  totalSales: number;
  totalQuantity: number;
}

interface CategoryReport {
  id: number;
  name: string;
  totalSales: number;
  totalQuantity :number;
}

interface Product {
  id: string;
  name: string;
}

interface SummaryReport {
  daily: { totalSales: number; orderCount: number };
  monthly: { totalSales: number; orderCount: number };
  allTime: { totalSales: number; orderCount: number };
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // เริ่มต้นให้ loading เป็น true
  const [productReports, setProductReports] = useState<ProductReport[]>([]);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [userAll, setUserAll] = useState<DashboardProps | null>(null);
  const [userData, setUserData] = useState<any>(null);  // Store resolved data

  const token = getCookie('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch protected user data
        const userResponse = await fetch('/api/protected', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        setUserData(userData.user);

        // Fetch reports and users
        const productData = await apiProxy('/reports/top-products', { token });
        const categoryData = await apiProxy('/reports/top-categories', { token });
        const summaryData = await apiProxy('/reports/summary', { token });

        setProductReports(productData || []);
        setCategoryReports(categoryData || []);
        setSummary(summaryData || null);

        console.log("productData : ", productData);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login'); // Redirect if any fetch fails
      } finally {
        setLoading(false); // เมื่อโหลดเสร็จแล้วเปลี่ยนให้ loading เป็น false
      }
    };

    fetchData();
  }, [token, router]);

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Handle case when user data is still not available
  if (!userData) {
    return (
      <Layout>
        <Typography variant="h6" align="center">
          No user data available
        </Typography>
      </Layout>
    );
  }

  // Render the user data once it's fetched
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Welcome {userData.username} to the Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Report */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Summary Report
            </Typography>
            {summary ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ borderBottom: '1px solid #ddd', paddingBottom: 1 }}>
                    <strong>Daily Sales:</strong> ฿{summary.daily.totalSales.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" sx={{ borderBottom: '1px solid #ddd', paddingBottom: 1 }}>
                    <strong>Daily Orders:</strong> {summary.daily.orderCount}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ borderBottom: '1px solid #ddd', paddingBottom: 1 }}>
                    <strong>Monthly Sales:</strong> ฿{summary.monthly.totalSales.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" sx={{ borderBottom: '1px solid #ddd', paddingBottom: 1 }}>
                    <strong>Monthly Orders:</strong> {summary.monthly.orderCount}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ borderBottom: '1px solid #ddd', paddingBottom: 1 }}>
                    <strong>All-Time Sales:</strong> ฿{summary.allTime.totalSales.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" sx={{ borderBottom: '1px solid #ddd', paddingBottom: 1 }}>
                    <strong>All-Time Orders:</strong> {summary.allTime.orderCount}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography>No summary data available.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Product Sales Report */}
        <Grid item xs={12}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top-Selling Products
            </Typography>
            {productReports.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Total Sales (฿)</TableCell>
                    <TableCell>Total Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productReports.map((productReport) => (
                    <TableRow key={productReport.product.id}>
                      <TableCell>{productReport.product.name}</TableCell>
                      <TableCell>฿{productReport.totalSales.toFixed(2)}</TableCell>
                      <TableCell>{productReport.totalQuantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No product data available.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Category Sales Report */}
        <Grid item xs={12}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top-Selling Categories
            </Typography>
            {categoryReports.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Total Sales (฿)</TableCell>
                    <TableCell>Total Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryReports.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>฿{category.totalSales.toFixed(2)}</TableCell>
                      <TableCell>{category.totalQuantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No category data available.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
