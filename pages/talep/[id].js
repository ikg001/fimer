// This file is deprecated and kept only for reference
// The active implementation is in [id].tsx

import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function TalepDetayLegacy() {
  const router = useRouter();
  const { id } = router.query;
  
  useEffect(() => {
    if (id) {
      // This will use the .tsx implementation
      router.replace(`/talep/${id}`);
    }
  }, [id, router]);
  
  return null; // Return nothing as we're redirecting
}