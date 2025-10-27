'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { newArrivals } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();
  const { toast } = useToast();

  // In a real app, you'd fetch this from a database.
  // We're also searching in the duplicated list from products/page.tsx for demo purposes
  const allProducts = [...newArrivals, ...newArrivals.slice(0, 4)].map((product, index) => ({
    ...product,
    id: index < newArrivals.length ? product.id : `${product.id}-${index}`,
  }));
  
  const product = allProducts.find((p) => p.id === id);
  const image = product ? PlaceHolderImages.find(img => img.id === product.imageId) : undefined;
  
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
  
  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const finalPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="container mx-auto py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="aspect-square relative rounded-lg overflow-hidden bg-card">
          {image && (
            <Image
              src={image.imageUrl}
              alt={product.name}
              fill
              data-ai-hint={image.imageHint}
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
          
          <div className="mt-4 text-base text-foreground/80 space-y-4">
            <p>
              This is a longer description for {product.name}. It captures the essence of the fragrance,
              highlighting its main notes, character, and the experience it evokes. This detailed text provides
              customers with a richer understanding of the scent profile, helping them make a more informed purchase decision.
            </p>
             <p>
              It could describe the top, middle, and base notes, the occasion it's best suited for, and the type of person who might wear it.
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
