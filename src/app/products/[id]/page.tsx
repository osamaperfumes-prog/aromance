'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const docRef = useMemoFirebase(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, `products/${id}`);
  }, [firestore, id]);


  useEffect(() => {
    if (!docRef) return;
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setProduct({ id: snapshot.id as string, ...data } as Product);
      } else {
        setProduct(null);
      }
      setIsLoading(false);
    }, (err) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [docRef]);

  const imageUrl = (product && product.imageUrl) ? product.imageUrl : '/placeholder.svg';
  
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
      return (
          <div className="container mx-auto py-8 md:py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="flex flex-col gap-4">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-10 w-3/4" />
                      <Skeleton className="h-8 w-48 mt-2" />
                      <div className="mt-4 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                      </div>
                      <Skeleton className="h-12 w-40 mt-6" />
                  </div>
              </div>
          </div>
      )
  }

  if (!product) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/products">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  const finalPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <div className="container mx-auto py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="aspect-square relative rounded-lg overflow-hidden bg-card">
          {product.imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          )}
          {product.discount > 0 && (
            <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-md">
              {product.discount}% OFF
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
            <Button asChild variant="link" className="self-start -ml-4">
                <Link href="/products">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to all products
                </Link>
            </Button>
          
          <h2 className="text-sm font-medium text-muted-foreground">{product.brand}</h2>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-primary">{product.name}</h1>
          
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(finalPrice)}</span>
            {product.discount > 0 && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          
           <div className="mt-4 flex flex-wrap gap-2">
            {Array.isArray(product.category) && product.category.map(cat => (
              <Badge key={cat} variant="secondary">{cat}</Badge>
            ))}
          </div>

          <div className="mt-4 text-base text-foreground/80 space-y-4">
            <p>
              {product.description}
            </p>
          </div>

          <div className="mt-6">
            <Button size="lg" className="w-full sm:w-auto" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
