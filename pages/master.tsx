import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import Layout from '@/component/Layout';
import { getCookie } from '@/utils/cookie';

type MasterData = {
  id: number;
  name: string;
  description?: string;
};

type TableProps = {
  data: MasterData[];
  tableName: string;
  onEdit: (item: MasterData) => void;
  onDelete: (id: number) => void;
};

const DynamicTable = ({ data, tableName, onEdit, onDelete }: TableProps) => (
  <Paper sx={{ marginBottom: 4 }}>
    <Typography variant="h6" sx={{ padding: 2 }}>
      {tableName}
    </Typography>

    <Table>
      <TableHead>
        <TableRow >
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          {/* <TableCell>Description</TableCell> */}
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item , index) => (
          <TableRow key={index}>
            <TableCell>{index +1}</TableCell>
            <TableCell>{item.name}</TableCell>
            {/* <TableCell>{item.description || 'N/A'}</TableCell> */}
            <TableCell>
              <Button
                variant="contained"
                color="info"
                onClick={() => onEdit(item)}
                sx={{ marginRight: 1 }}
              >
                Edit
              </Button>
              <Button variant="contained" color="error" onClick={() => onDelete(item.id)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

export default function ManageMasters() {
  const [paymentTypes, setPaymentTypes] = useState<MasterData[]>([]);
  const [categories, setCategories] = useState<MasterData[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTable, setCurrentTable] = useState<'payment-types' | 'categories'>('payment-types');

  const token = getCookie('token');

  // Helper function for API requests
  const fetchData = async (url: string, method: string = 'GET', body: any = null) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      //'Authorization': `Bearer ${token}`,
    };

    const options: RequestInit = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    return response.json();
  };

  // Fetch all payment types and categories on component mount
  useEffect(() => {
    const fetchDataForTables = async () => {
      try {
        // Fetch payment types
        const paymentTypesResponse = await fetchData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment-types`);
        if (paymentTypesResponse.status === 'success') {
          setPaymentTypes(paymentTypesResponse.data);
        }

        // Fetch categories
        const categoriesResponse = await fetchData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`);
        if (categoriesResponse.status === 'success') {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataForTables();
  }, [token]);

  // Handle opening the dialog for adding/editing
  const handleOpenDialog = (item: MasterData | null, table: 'payment-types' | 'categories') => {
    setEditingItem(item);
    setCurrentTable(table);
    setDialogOpen(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setEditingItem(null);
    setDialogOpen(false);
  };

  // Handle save (add/edit)
  const handleSave = async () => {
    if (!editingItem?.name) return;

    const method = editingItem?.id ? 'PUT' : 'POST';
    const endpoint = editingItem?.id
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${currentTable}/${editingItem.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${currentTable}`;

    try {
      const response = await fetchData(endpoint, method, {
        name: editingItem.name,
        description: editingItem.description,
      });

      if (response.status === 'success') {
        const savedItem = response.data;

        if (method === 'POST') {
          if (currentTable === 'payment-types') {
            setPaymentTypes([...paymentTypes, savedItem]);
          } else {
            setCategories([...categories, savedItem]);
          }
        } else {
          if (currentTable === 'payment-types') {
            setPaymentTypes(paymentTypes.map((item) => (item.id === savedItem.id ? savedItem : item)));
          } else {
            setCategories(categories.map((item) => (item.id === savedItem.id ? savedItem : item)));
          }
        }

        handleCloseDialog();
      } else {
        console.error('Error saving item:', response.message);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetchData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${currentTable}/${id}`, 'DELETE');
      if (response.status === 'success') {
        if (currentTable === 'payment-types') {
          setPaymentTypes(paymentTypes.filter((item) => item.id !== id));
        } else {
          setCategories(categories.filter((item) => item.id !== id));
        }
      } else {
        console.error('Error deleting item:', response.message);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
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
       

        {/* Toggle Button for Changing Tables */}
        <Box sx={{ marginTop: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentTable('payment-types')}
            sx={{ marginRight: 2 }}
          >
            Payment Types Table
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCurrentTable('categories')}
          >
            Categories Table
          </Button>
        </Box>
         {/* Single Add Button that changes dynamically */}
        <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog(null, currentTable)}
            sx={{ marginTop: 3 }}
          >
            {currentTable === 'payment-types' ? 'Add Payment Type' : 'Add Category'}
        </Button>
      </Box>
      

      {/* Dynamic Table Render */}
      {currentTable === 'payment-types' && (
        <DynamicTable
          data={paymentTypes}
          tableName="Payment Types"
          onEdit={(item) => handleOpenDialog(item, 'payment-types')}
          onDelete={handleDelete}
        />
      )}
      {currentTable === 'categories' && (
        <DynamicTable
          data={categories}
          tableName="Categories"
          onEdit={(item) => handleOpenDialog(item, 'categories')}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingItem ? 'Edit' : 'Add'} {currentTable === 'payment-types' ? 'Payment Type' : 'Category'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={editingItem?.name || ''}
            onChange={(e) =>
              setEditingItem({ ...editingItem, name: e.target.value } as MasterData)
            }
            sx={{ marginBottom: 2 }}
          />
          {/* <TextField
            label="Description"
            fullWidth
            value={editingItem?.description || ''}
            onChange={(e) =>
              setEditingItem({ ...editingItem, description: e.target.value } as MasterData)
            }
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
