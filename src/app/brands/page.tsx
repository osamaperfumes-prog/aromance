'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue } from 'firebase/database';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type ProductWithId = Product & { id: string };

export default function BrandsPage() {
  const { database } = useFirebase();
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const productsRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'products');
  }, [database]);

  useEffect(() => {
    if (!productsRef) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: ProductWithId[] = Object.values(data);
        const uniqueBrands = [...new Set(productsList.map(p => p.brand))].sort();
        setBrands(uniqueBrands);
      } else {
        setBrands([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products for brands:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [productsRef]);

  return (
    <div className="bg-card">
      <div className="container mx-auto py-12 md:py-20">
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary">All Brands</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Explore our collection of world-renowned fragrance houses.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-lg" />
            ))
          ) : brands.length > 0 ? (
            brands.map((brand) => (
              <Link key={brand} href={`/brands/${encodeURIComponent(brand)}`}>
                <Card className="flex items-center justify-center h-24 p-4 hover:shadow-md hover:border-primary transition-all">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg text-center font-medium">{brand}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-center col-span-full">No brands found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
