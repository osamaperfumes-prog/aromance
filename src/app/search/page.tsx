'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { useFirebase } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { searchProducts } from '@/ai/flows/search-flow';

type ProductWithKey = Product & { key: string };

function SearchPageComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { database } = useFirebase();

  const [allProducts, setAllProducts] = useState<ProductWithKey[]>([]);
  const [keywordResults, setKeywordResults] = useState<ProductWithKey[]>([]);
  const [semanticResults, setSemanticResults] = useState<ProductWithKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    if (!database) return;

    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productsList: ProductWithKey[] = Object.entries(data).map(
            ([key, value]) => ({
              key,
              id: key,
              ...((value as Omit<Product, 'id'>)),
            })
          );
          setAllProducts(productsList);
        } else {
          setAllProducts([]);
        }
        setIsLoading(false);
      },
      { onlyOnce: true } // Fetch all products once
    );

    return () => unsubscribe();
  }, [database]);

  useEffect(() => {
    if (isLoading || !query) {
      setKeywordResults([]);
      setSemanticResults([]);
      setIsAiLoading(false);
      return;
    }

    // Perform Keyword Search (client-side)
    const lowercasedQuery = query.toLowerCase();
    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedQuery) ||
        product.brand.toLowerCase().includes(lowercasedQuery) ||
        product.description.toLowerCase().includes(lowercasedQuery)
    );
    setKeywordResults(filtered);

    // Perform Semantic Search (server-side AI flow)
    async function performSemanticSearch() {
      setIsAiLoading(true);
      try {
        const result = await searchProducts({
          query,
          products: allProducts,
        });
        const semanticProductIds = new Set(result.productIds);
        const semanticMatches = allProducts.filter((p) =>
          semanticProductIds.has(p.id)
        );
        setSemanticResults(semanticMatches);
      } catch (error) {
        console.error('Semantic search failed:', error);
        setSemanticResults([]);
      } finally {
        setIsAiLoading(false);
      }
    }

    performSemanticSearch();
  }, [query, allProducts, isLoading]);

  const combinedResults = [
    ...keywordResults,
    ...semanticResults.filter(
      (semanticItem) =>
        !keywordResults.some(
          (keywordItem) => keywordItem.id === semanticItem.id
        )
    ),
  ];

  return (
    <div className="bg-card">
      <div className="container mx-auto py-12 md:py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Search Results
          </h1>
          {query ? (
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Showing results for &quot;{query}&quot;
            </p>
          ) : (
             <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Please enter a search term to begin.
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : query && combinedResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {combinedResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
             {isAiLoading && (
                 <p className="text-center col-span-full mt-8 text-muted-foreground">
                    Looking for more results with AI...
                </p>
             )}
          </>
        ) : (
          <p className="text-center col-span-full text-muted-foreground">
            {query ? 'No products found matching your search.' : ''}
          </p>
        )}
      </div>
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-12 md:py-20"><h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">Loading...</h1></div>}>
            <SearchPageComponent />
        </Suspense>
    )
}
