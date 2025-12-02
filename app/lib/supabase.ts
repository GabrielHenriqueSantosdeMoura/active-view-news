
// Get current user ID from localStorage
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem('activeview_user_id');
  console.log('getCurrentUserId:', userId);
  return userId;
};

// Set current user ID in localStorage
export const setCurrentUserId = (userId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('activeview_user_id', userId);
  }
};

// Clear user session
export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('activeview_user_id');
  }
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return getCurrentUserId() !== null;
};
