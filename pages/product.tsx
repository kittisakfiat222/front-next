import { useEffect, useState, useRef } from "react";
import JsBarcode from "jsbarcode";
import { useRouter } from 'next/router';
import {
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";
import Layout from "@/component/Layout";
import { getCookie } from "@/utils/cookie";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  description: string;
  categoryId: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    barcode: "",
    description: "",
    categoryId: 0,
  });

  // Pagination and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = getCookie("token");
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    if(token) {
      fetchProducts();
      fetchCategories();
    }else{

    }
   
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Error fetching products: ${response.status}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categoriesPD`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Error fetching categories: ${response.status}`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Barcode rendering for paginated products
  useEffect(() => {
    paginatedProducts.forEach((product) => {
      if (product.barcode) {
        const canvas = canvasRefs.current[product.barcode];
        if (canvas) {
          JsBarcode(canvas, product.barcode, {
            format: "EAN13",
            displayValue: true,
          });
        }
      }
    });
  }, [paginatedProducts]);

  const handleAddOrEditProduct = async () => {
    if (
      !currentProduct.name ||
      currentProduct.price! <= 0 ||
      currentProduct.stock! < 0 ||
      !currentProduct.barcode ||
      !currentProduct.description ||
      currentProduct.categoryId! === 0
    ) {
      alert("Please fill in all fields with valid data!");
      return;
    }

    const method = currentProduct.id ? "PUT" : "POST";
    const url = currentProduct.id
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${currentProduct.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentProduct),
      });

      if (response.ok) {
        alert(currentProduct.id ? "Product updated!" : "Product added!");
        fetchProducts();
        setDialogOpen(false);
        resetProductForm();
      } else {
        const errorText = await response.text();
        console.error("Error saving product:", errorText);
        alert("Failed to save product. Check logs for details.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Product deleted!");
        fetchProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setDialogOpen(true);
  };

  const handleAddClick = () => {
    setCurrentProduct({
      id: 0,
      name: "",
      price: 0,
      stock: 0,
      barcode: generateBarcode(),
      description: "",
      categoryId: 0,
    });
    setDialogOpen(true);
  };

  const resetProductForm = () => {
    setCurrentProduct({
      id: 0,
      name: "",
      price: 0,
      stock: 0,
      barcode: "",
      description: "",
      categoryId: 0,
    });
  };

  const generateBarcode = (): string => {
    let barcodePrefix = "";
    for (let i = 0; i < 12; i++) {
      barcodePrefix += Math.floor(Math.random() * 10);
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcodePrefix[i], 10);
      sum += i % 2 === 0 ? digit * 1 : digit * 3;
    }

    const checksum = (10 - (sum % 10)) % 10;
    return barcodePrefix + checksum;
  };

  return (
    <Layout>
      <Paper sx={{ padding: 2, marginBottom: 2, display: "flex", gap: 2 }}>
        <TextField
          placeholder="Search by name or barcode"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          fullWidth
        />
        <Button variant="contained" onClick={handleAddClick}>
          Add Product
        </Button>
      </Paper>
      <Paper sx={{ padding: 2 }}>
        {loading ? (
          <Typography>Loading products...</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Barcode</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>฿{product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <canvas ref={(el) => (canvasRefs.current[product.barcode] = el)} />
                  </TableCell>
                  <TableCell>
                    {categories.find((category) => category.id === product.categoryId)?.name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditClick(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      sx={{ ml: 1 }}
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
         <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
            variant="outlined"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {/* <Typography sx={{ mx: 2 ,justifyContent: "center" }}>Page {currentPage}</Typography> */}
            <Button
            variant="outlined"
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < Math.ceil(filteredProducts.length / itemsPerPage) ? prev + 1 : prev
                )
              }
              disabled={currentPage >= Math.ceil(filteredProducts.length / itemsPerPage)}
            >
              Next
            </Button>
          </Box>
        
      </Paper>
     

      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{currentProduct.id ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={currentProduct.name || ""}
            onChange={(e) => setCurrentProduct((prev) => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={currentProduct.description || ""}
            onChange={(e) =>
              setCurrentProduct((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Price"
            type="number"
            value={currentProduct.price || ""}
            onChange={(e) =>
              setCurrentProduct((prev) => ({
                ...prev,
                price: parseFloat(e.target.value),
              }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Stock"
            type="number"
            value={currentProduct.stock || ""}
            onChange={(e) =>
              setCurrentProduct((prev) => ({
                ...prev,
                stock: parseInt(e.target.value, 10),
              }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Barcode"
            value={currentProduct.barcode || ""}
            onChange={(e) => setCurrentProduct((prev) => ({ ...prev, barcode: e.target.value }))}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={currentProduct.categoryId || ""}
              onChange={(e) =>
                setCurrentProduct((prev) => ({
                  ...prev,
                  categoryId: parseInt(e.target.value, 10),
                }))
              }
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddOrEditProduct}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
     
	
	
    </Layout>
  );
}
