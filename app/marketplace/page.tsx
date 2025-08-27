"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketplaceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/products');
  }, [router]);

  return null; // Optionally, you can return a loading spinner or message here
}
