import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import {  GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {User} from '../models/user';
import { getCookie } from "@/utils/cookie";



const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
interface DashboardProps {
  userAll: {
    users: User[];
  };
}

const token = getCookie('token');

export default function Home() {
  const [userData, setUserData] = useState<DashboardProps | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch users: ${res.statusText}`);
          }
          return res.json();
        }),
    ])
      .then(([userData]) => {
        setUserData(userData || { users: [] }); // Ensure fallback to empty users array
        console.log("Response data:", userData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <Container maxWidth="lg">
      {loading ? (
        <Typography variant="h6" align="center">
          Loading...
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {userData?.users?.length > 0 ? ( // Safely check userData and users array
            userData.users.map((user : any) => (
              <Grid item xs={12} md={6} key={user.id}>
                <Card>
                  <CardMedia
                    component="img"
                    sx={{ height: 140 }}
                    image={user.avatar || "/placeholder.png"} // Fallback image
                    title={user.fname}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {user.fname} {user.lname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {user.username}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Link href={`/user/${user.id}`} passHref>
                      <Button size="small">Learn More</Button>
                    </Link>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="h6" align="center" sx={{ width: '100%' }}>
              No users found.
            </Typography>
          )}
        </Grid>
      )}
    </Container>
  );
}




