
export const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });
  
      if (res.ok) {
        // Redirect to the login page or home page
        window.location.href = '/';
      } else {
        console.error('Failed to log out:', await res.json());
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };