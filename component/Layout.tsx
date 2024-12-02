// import React, { ReactNode, useState, useEffect } from 'react';
// import { Box, CssBaseline } from '@mui/material';
// import Sidebar from './Sidebar';
// import TopBar from './TopBar';
// import { useRouter } from 'next/router';

// const Layout = ({ children }: { children: ReactNode }) => {
//   const router = useRouter();
//   const [content, setContent] = useState<ReactNode>(children);

//   // Fetch content dynamically when the route changes
//   useEffect(() => {
//     const fetchContent = async () => {
//       const res = await fetch(router.pathname); // Fetch the current route content
//       const html = await res.text();
//       setContent(<div dangerouslySetInnerHTML={{ __html: html }} />);
//     };

//     fetchContent();
//   }, [router.pathname]); // Re-run when the route changes

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <CssBaseline />
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
//         {/* Top Bar */}
//         <TopBar />

//         {/* Content Zone */}
//         <Box sx={{ marginTop: '64px' }}>
//           {content}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default Layout;


import React, { ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar  from './Sidebar';


import TopBar from './TopBar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        {/* Top Bar */}
        <TopBar />

        {/* Content Zone */}
        <Box sx={{ marginTop: '64px' ,minHeight: '100vh' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
