import { useState , useEffect} from 'react';
import { useRouter } from 'next/router';
import useProtectedData from  '../utils/checkAuth';
import Link from 'next/link';

interface LoginFormData {
  username: string;
  password: string;
}

const Home = () => {
 
  
  return (
    <div className="container">
     <Link href="/login"> <button>Get start</button></Link>
    
    </div>
  );
};

export default Home;