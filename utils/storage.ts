// This file is now a thin wrapper or used for sync reads where strictly necessary
// Prefer using api.wishlist methods for actions.

export const getWishlist = (): string[] => {
  try {
    const stored = localStorage.getItem('gifty_wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

// Deprecated: Logic moved to API, but kept for sync UI checks in GiftCard until refactor
export const isInWishlist = (id: string): boolean => {
  const current = getWishlist();
  return current.includes(id);
};

// These should ideally be removed, but we keep them as wrappers for now if any component uses them synchronously
export const addToWishlist = (id: string) => {
   // Optimistic update wrapper if needed, otherwise rely on API
   const current = getWishlist();
   if (!current.includes(id)) {
     localStorage.setItem('gifty_wishlist', JSON.stringify([...current, id]));
   }
};

export const removeFromWishlist = (id: string) => {
   const current = getWishlist();
   localStorage.setItem('gifty_wishlist', JSON.stringify(current.filter(i => i !== id)));
};
