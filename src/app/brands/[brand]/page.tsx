'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProductWithId = Product & { id: string };

export default function BrandDetailPage() {
  const params = useParams();
  const brand = typeof params.brand === 'string' ? decodeURIComponent(params.brand) : '';
  const { database } = useFirebase();

  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const brandProductsQuery = useMemoFirebase(() => {
    if (!database || !brand) return null;
    const productsRef = ref(database, 'products');
    return query(productsRef, orderByChild('brand'), equalTo(brand));
  }, [database, brand]);

  useEffect(() => {
    if (!brandProductsQuery) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onValue(brandProductsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: ProductWithId[] = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        setProducts(productsList.reverse()); // Show newest first
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error(`Error fetching products for brand ${brand}:`, error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [brandProductsQuery, brand]);

  return (
    <div className="bg-card">
      <div className="container mx-auto py-12 md:py-20">
        <div className="mb-12 px-4">
            <Button asChild variant="link" className="-ml-4">
                <Link href="/brands">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to all brands
                </Link>
            </Button>
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary">{brand}</h1>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Discover all fragrances from {brand}.</p>
            </div>
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
            <p className="text-center col-span-full text-muted-foreground">No products found for {brand}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
