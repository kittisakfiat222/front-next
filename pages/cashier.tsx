import { useEffect, useState } from "react";
import {
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  ButtonGroup,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
} from "@mui/material";
import { getCookie } from "@/utils/cookie";
import Layout from "@/component/Layout";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Cashier() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState(""); // Input for barcode scanner
  const [searchQuery, setSearchQuery] = useState(""); // Search query for product
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [itemsPerPage] = useState(5); // Items per page for pagination

  const userId = getCookie("userId");
  const token = getCookie("token");

  // Fetch product data on component mount
  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/allpd`, {
      headers: {
        "Content-Type": "application/json",
        //'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []); // Handle potential empty response
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Handle barcode scan
  const handleBarcodeScan = () => {
    const product = products.find((p) => p.barcode === barcodeInput);
    if (product) {
      addToCart(product); // Add product to cart if found
    } else {
      alert("Product not found!"); // Notify if the product is not found
    }
    setBarcodeInput(""); // Reset the input
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Decrease quantity
  const decreaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Increase quantity
  const increaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Handle checkout
  const checkout = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ items: cart, id: userId }),
    });
 
    setReceivedAmount(0);
    if (response.ok) {
      alert("Order placed successfully!");
      setCart([]); // Clear the cart after successful order

    } else {
      alert("Failed to place order.");
    }
  };

  // Filter products based on search query (name or barcode)
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery)
  );

  // Get paginated products
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  // เพิ่ม state สำหรับจัดการเงินที่ได้รับและเงินทอน
  const [receivedAmount, setReceivedAmount] = useState<number | "">(""); // เก็บจำนวนเงินที่ได้รับ

  // คำนวณเงินทอน
  const calculateChange = () => {
    const total = calculateTotal(); // ราคารวม
    return receivedAmount ? Math.max(0, receivedAmount - total) : 0; // หากจำนวนเงินที่ได้รับมากกว่าราคารวม ให้คืนเงินทอน
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        POS Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Barcode Scanner Input */}
        <Grid item xs={12}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Scan Barcode
            </Typography>
            <TextField
              fullWidth
              label="Scan or Enter Barcode"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)} // Properly update the input value
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleBarcodeScan(); // Trigger barcode scan when Enter is pressed
                }
              }}
              variant="outlined"
              autoFocus // Ensure input is focused when the component loads
            />
          </Paper>
        </Grid>

        

        {/* Cart Section */}
        <Grid item xs={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cart
            </Typography>
            {cart.length === 0 ? (
              <Typography>No items in the cart.</Typography>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>฿{item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>฿{(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <ButtonGroup variant="outlined" size="small">
                            <Button onClick={() => decreaseQuantity(item.id)}>-</Button>
                            <Button disabled>{item.quantity}</Button>
                            <Button onClick={() => increaseQuantity(item.id)}>+</Button>
                          </ButtonGroup>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => removeFromCart(item.id)}
                            color="error"
                            sx={{ ml: 2 }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box mt={2}>
                  <Typography variant="h6">
                    Total: ฿{calculateTotal().toFixed(2)}
                  </Typography>
                </Box>

                {/* ช่องกรอกเงินที่ได้รับ */}
                <Box mt={2}>
                  <TextField
                    label="Received Amount"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(Number(e.target.value) || "")}
                  />
                </Box>

                {/* แสดงเงินทอน */}
                <Box mt={2}>
                  <Typography variant="h6">
                    Change: ฿{calculateChange().toFixed(2)}
                  </Typography>
                </Box>

                {/* ปุ่ม Checkout */}
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={checkout}
                    disabled={!receivedAmount || receivedAmount < calculateTotal()} // ปิดปุ่มถ้าเงินที่ได้รับไม่พอ
                  >
                    Checkout
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Product List Table */}
        <Grid item xs={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Products
            </Typography>
            <TextField
              label="Search Products"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update search query
              margin="normal"
            />
            {loading ? (
              <CircularProgress />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Barcode</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>฿{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.barcode}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* Pagination Controls */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </Box>
            </Grid>
          </Paper>
        </Grid>

        
      </Grid>
    </Layout>
  );
}
