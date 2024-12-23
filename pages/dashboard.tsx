import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Grid, Paper, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Layout from '@/component/Layout';
import { GetServerSideProps } from 'next';
import type { User } from '../models/user';
import { setCookie, getCookie, deleteCookie } from '@/utils/cookie';

interface DashboardProps {
  userAll?: { users: User[] }; // ประกาศว่า userAll เป็น object ที่มี property users ซึ่งเป็น array ของ User
}
interface ProductReport {
  id: string;
  product: Product;  // product should be of type Product
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
  const [loading, setLoading] = useState(false);
  const [productReports, setProductReports] = useState<ProductReport[]>([]);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [userAll, setUserAll] = useState<DashboardProps | null>(null);
  const [userData, setUserData] = useState<any>(null);  // Store resolved data

  const token = getCookie('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const checkJsonResponse = async (res: Response) => {
        if (!res.ok) {
          console.error(`API call failed with status: ${res.status}`);
          console.error(`Response URL: ${res.url}`);
          throw new Error(`Error fetching data: ${res.statusText}`);
        }
        const contentType = res.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          console.error(`Unexpected response content type: ${contentType}`);
          throw new Error('Received non-JSON response');
        }
      };

      try {
        // Fetch protected user data
        const userRes = await fetch('/api/protected', {
          method: 'GET',
          credentials: 'same-origin', 
        });
        if (!userRes.ok) {
          console.error('Error fetching user data');
          router.push('/login');
        }
        const userData = await userRes.json();
        setUserData(userData.user);

        // Fetch reports and users
        const responses = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/top-products`, {
            headers: { /*'Authorization': `Bearer ${token}`*/ },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/top-categories`, {
            headers: { /*'Authorization': `Bearer ${token}`*/ },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/summary`, {
            headers: { /*'Authorization': `Bearer ${token}`*/ },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
            headers: { /*'Authorization': `Bearer ${token}`*/ },
          }),
        ]);

        const [productData, categoryData, summaryData, userAllData] = await Promise.all(
          responses.map((res) => checkJsonResponse(res))
        );

        setProductReports(productData || []);
        setCategoryReports(categoryData || []);
        setSummary(summaryData || null);
        setUserAll(userAllData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');  // Redirect if any fetch fails
      } finally {
        setLoading(false);
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
                  {productReports.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.product.name}</TableCell>
                      <TableCell>฿{product.totalSales.toFixed(2)}</TableCell>
                      <TableCell>{product.totalQuantity}</TableCell>
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

      {/* User Data from Server */}
      <Box sx={{ bgcolor: 'background.paper', minHeight: '300px', padding: 3, borderRadius: 2, boxShadow: 2, marginTop: 3 }}>
        <Typography variant="h6">User Data</Typography>
        <pre>{JSON.stringify(userAll, null, 2)}</pre>
      </Box>
    </Layout>
  );
}
