'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { useFirebase } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type ProductWithKey = Product & { key: string };

export default function ProductsPage() {
  const { database } = useFirebase();
  const [products, setProducts] = useState<ProductWithKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database) return;

    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: ProductWithKey[] = Object.entries(data).map(([key, value]) => ({
          key,
          id: key, // Use the database key as the product ID
          ...((value as Omit<Product, 'id'>)),
        }));
        setProducts(productsList.reverse()); // Show newest first
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [database]);

  return (
    <div className="bg-card">
      <div className="container mx-auto py-12 md:py-20">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">All Fragrances</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">Discover your signature scent from our curated collection.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center col-span-full">No products have been added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
