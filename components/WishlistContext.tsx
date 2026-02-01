import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: Set<string>;
  addToWishlist: (id: string) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Sync with backend or local storage on auth change
  useEffect(() => {
    const syncAndLoad = async () => {
      setIsLoading(true);
      
      // If user logs in, check if we have any pending local wishlist items
      // In a real scenario, this would be handled by a more robust sync, 
      // but here we check the local storage key used by the 'guest' state.
      if (user) {
          try {
              const localStored = localStorage.getItem('gifty_wishlist');
              const localItems: string[] = localStored ? JSON.parse(localStored) : [];
              
              if (localItems.length > 0) {
                  // Attempt to upload each item
                  // Note: This is simplified. Ideally backend has a bulk add endpoint.
                  await Promise.all(localItems.map(id => api.wishlist.add(id).catch(e => console.warn('Failed to sync item', id))));
                  
                  // Clear local storage ONLY if we successfully processed the attempt
                  // We clear it to avoid re-syncing constantly, assuming server is now the source of truth
                  localStorage.removeItem('gifty_wishlist');
              }
          } catch (e) {
              console.error("Error during wishlist sync", e);
          }
      }

      try {
        const ids = await api.wishlist.getAll();
        setWishlistIds(new Set(ids));
      } catch (e) {
        console.error("Failed to load wishlist", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    syncAndLoad();
  }, [user]);

  const addToWishlist = useCallback(async (id: string) => {
    setWishlistIds(prev => new Set(prev).add(id));
    try {
      await api.wishlist.add(id);
    } catch (e) {
      console.error("Add to wishlist failed", e);
      setWishlistIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const removeFromWishlist = useCallback(async (id: string) => {
    setWishlistIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    try {
      await api.wishlist.remove(id);
    } catch (e) {
      console.error("Remove from wishlist failed", e);
      setWishlistIds(prev => new Set(prev).add(id));
    }
  }, []);

  const isInWishlist = useCallback((id: string) => {
    return wishlistIds.has(id);
  }, [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, addToWishlist, removeFromWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};