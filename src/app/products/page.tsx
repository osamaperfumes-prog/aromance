'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue, query, orderByChild } from 'firebase/database';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type ProductWithId = Product & { id: string };

export default function ProductsPage() {
  const { database } = useFirebase();
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const productsQuery = useMemoFirebase(() => {
    if (!database) return null;
    const productsRef = ref(database, 'products');
    return query(productsRef, orderByChild('createdAt'));
  }, [database]);


  useEffect(() => {
    if (!productsQuery) {
        setIsLoading(false);
        return;
    }
    const unsubscribe = onValue(productsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: ProductWithId[] = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        setProducts(productsList.reverse()); // To show newest first
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [productsQuery]);

  return (
    <div className="bg-card">
      <div className="container mx-auto py-12 md:py-20">
        <div className="text-center mb-12 px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary">All Fragrances</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">Discover your signature scent from our curated collection.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
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
