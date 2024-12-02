import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const useProtectedData = () => {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch the session or protected data
    const fetchData = async () => {
      try {
        const res = await fetch('/api/protected', {
          method: 'GET',
          credentials: 'same-origin', // Ensure cookies are sent with the request
        });

        if (res.ok) {
          const data = await res.json();
          setUserData(data.user); // Extract and set the user data
        } else {
          router.push('/login'); // Redirect to login if session is invalid
        }
      } catch (error) {
        console.error('Error fetching protected data:', error);
        router.push('/login'); // Redirect to login on error
      }
    };

    fetchData();
  }, [router]);

  return userData;
};

export default useProtectedData;