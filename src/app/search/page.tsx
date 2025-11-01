'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue, query, orderByChild } from 'firebase/database';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { searchProducts } from './actions'; 

type ProductWithId = Product & { id: string };

function SearchPageComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { database } = useFirebase();

  const [allProducts, setAllProducts] = useState<ProductWithId[]>([]);
  const [keywordResults, setKeywordResults] = useState<ProductWithId[]>([]);
  const [semanticResults, setSemanticResults] = useState<ProductWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true);
  
  const productsQuery = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'products');
  }, [database]);

  useEffect(() => {
    if (!productsQuery) {
        setIsLoading(false);
        return;
    };
    const unsubscribe = onValue(productsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const productsList: ProductWithId[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            setAllProducts(productsList);
        } else {
            setAllProducts([]);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching all products:", error);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [productsQuery]);


  useEffect(() => {
    if (isLoading || !query) {
      setKeywordResults([]);
      setSemanticResults([]);
      setIsAiLoading(!query ? false : true);
      return;
    }

    // Reset states for new search
    setIsAiLoading(true);
    setKeywordResults([]);
    setSemanticResults([]);

    // Perform Keyword Search (client-side)
    const lowercasedQuery = query.toLowerCase();
    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedQuery) ||
        product.brand.toLowerCase().includes(lowercasedQuery) ||
        product.description.toLowerCase().includes(lowercasedQuery) ||
        (Array.isArray(product.category) && product.category.some(c => c.toLowerCase().includes(lowercasedQuery)))
    );
    setKeywordResults(filtered);

    // Perform Semantic Search (server-side AI flow)
    async function performSemanticSearch() {
      if (allProducts.length === 0) {
        setIsAiLoading(false);
        return;
      };
      
      try {
        const productsForAI = allProducts.map(p => ({
          ...p,
          id: p.id,
          category: Array.isArray(p.category) ? p.category : [],
        }));

        const result = await searchProducts({
          query,
          products: productsForAI,
        });

        const semanticProductIds = new Set(result.productIds);
        const semanticMatches = allProducts.filter((p) =>
          semanticProductIds.has(p.id)
        );
        setSemanticResults(semanticMatches);
      } catch (error) {
        console.error('Semantic search failed:', error);
        setSemanticResults([]); // Clear on error
      } finally {
        setIsAiLoading(false);
      }
    }

    performSemanticSearch();
  }, [query, allProducts, isLoading]);

  const combinedResults = useMemo(() => {
    const keywordIds = new Set(keywordResults.map(p => p.id));
    const uniqueSemanticResults = semanticResults.filter(p => !keywordIds.has(p.id));
    return [...keywordResults, ...uniqueSemanticResults];
  }, [keywordResults, semanticResults]);
  
  const hasSearched = query.length > 0;
  const noResultsFound = hasSearched && !isLoading && !isAiLoading && combinedResults.length === 0;

  return (
    <div className="bg-card">
      <div className="container mx-auto py-12 md:py-20">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Search Results
          </h1>
          {query ? (
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Showing results for &quot;{query}&quot;
            </p>
          ) : (
             <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Please enter a search term in the bar above to find products.
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
        ) : noResultsFound ? (
           <p className="text-center col-span-full text-muted-foreground">
            No products found matching your search term &quot;{query}&quot;.
          </p>
        ) : (
          <>
            {combinedResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {combinedResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
             {isAiLoading && (
                 <p className="text-center col-span-full mt-8 text-muted-foreground">
                    Looking for more results with AI...
                </p>
             )}
          </>
        )}
      </div>
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto py-12 md:py-20">
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
            </div>
        }>
            <SearchPageComponent />
        </Suspense>
    )
}
