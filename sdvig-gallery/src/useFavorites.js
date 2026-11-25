import { useEffect, useState } from 'react';

const storageKey = 'sdvig-gallery:favorites';

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch {
      // Favorites are still available until the tab closes.
    }
  }, [favorites]);

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((saved) => saved !== id) : [...current, id],
    );
  }

  return { favorites, toggleFavorite };
}
