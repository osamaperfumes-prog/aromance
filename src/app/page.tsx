'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/ProductCard';
import { categories, trustBadges } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue, query, orderByChild, limitToLast, push, serverTimestamp } from 'firebase/database';
import type { Product, Testimonial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type ProductWithId = Product & { id: string };

export default function Home() {
  const testimonialImages = PlaceHolderImages.filter(img => img.id.startsWith('testimonial'));
  const { database } = useFirebase();
  const { toast } = useToast();
  const [newArrivals, setNewArrivals] = useState<ProductWithId[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const recentProductsQuery = useMemoFirebase(() => {
    if (!database) return null;
    const productsRef = ref(database, 'products');
    return query(productsRef, orderByChild('createdAt'), limitToLast(4));
  }, [database]);
  
  const testimonialsQuery = useMemoFirebase(() => {
    if (!database) return null;
    const testimonialsRef = ref(database, 'testimonials');
    return query(testimonialsRef, orderByChild('createdAt'), limitToLast(4));
  }, [database]);


  useEffect(() => {
    if (!recentProductsQuery) {
        setIsLoadingProducts(false);
        return;
    };

    const unsubscribe = onValue(recentProductsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const productsList: ProductWithId[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            setNewArrivals(productsList.reverse()); // Reverse to show newest first
        } else {
            setNewArrivals([]);
        }
        setIsLoadingProducts(false);
    }, (error) => {
        console.error("Error fetching new arrivals:", error);
        setIsLoadingProducts(false);
    });

    return () => unsubscribe();
  }, [recentProductsQuery]);

  useEffect(() => {
    if (!testimonialsQuery) {
        setIsLoadingTestimonials(false);
        return;
    }

    const unsubscribe = onValue(testimonialsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const testimonialsList: Testimonial[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            setTestimonials(testimonialsList.reverse());
        } else {
            setTestimonials([]);
        }
        setIsLoadingTestimonials(false);
    }, (error) => {
        console.error("Error fetching testimonials:", error);
        setIsLoadingTestimonials(false);
    });

    return () => unsubscribe();
  }, [testimonialsQuery]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !database) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    setIsSubscribing(true);
    try {
      const subscribersRef = ref(database, 'subscribers');
      await push(subscribersRef, {
        email: email,
        subscribedAt: serverTimestamp(),
      });
      toast({
        title: 'Subscription Successful!',
        description: 'You have been added to our mailing list.',
      });
      setEmail('');
    } catch (error) {
      console.error('Error subscribing email:', error);
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description: 'Could not subscribe your email. Please try again.',
      });
    } finally {
      setIsSubscribing(false);
    }
  };


  return (
    <div className="flex flex-col">
      {/* Trust Badges */}
      <section className="w-full bg-primary-foreground py-3">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-4 text-center">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                <badge.icon className="w-5 h-5 text-accent" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero / Shop By Type */}
      <section className="w-full py-12 md:py-20 bg-card">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Shop By Type</h2>
          <p className="text-lg text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
            Find the perfect fragrance for any occasion. Whether you need a small bottle for your next trip or a luxurious gift set, we have you covered.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const image = PlaceHolderImages.find(img => img.id === category.imageId);
              return (
                <Link href="/products" key={category.title}>
                  <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-0 relative h-64">
                      {image && (
                         <Image
                          src={image.imageUrl}
                          alt={category.title}
                          fill
                          data-ai-hint={image.imageHint}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                        <h3 className="text-2xl font-semibold text-white">{category.title}</h3>
                        <p className="text-sm text-white/90 mt-2">{category.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* New Arrivals */}
      <section className="w-full py-12 md:py-20">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">New Arrivals</h2>
            <Button variant="link" asChild>
              <Link href="/products">See All &rarr;</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoadingProducts ? (
               Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <Skeleton className="h-[250px] w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))
            ) : newArrivals.length > 0 ? (
                newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            ) : (
              <p className="text-center col-span-full">No products have been added yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-20 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingTestimonials ? (
               Array.from({ length: 4 }).map((_, index) => (
                 <Card key={index}>
                   <CardContent className="pt-6">
                     <Skeleton className="h-5 w-24 mb-2" />
                     <Skeleton className="h-4 w-full mb-1" />
                     <Skeleton className="h-4 w-full mb-1" />
                     <Skeleton className="h-4 w-3/4" />
                   </CardContent>
                   <CardFooter>
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4 space-y-2">
                         <Skeleton className="h-4 w-24" />
                      </div>
                   </CardFooter>
                 </Card>
               ))
            ) : testimonials.length > 0 ? (
                testimonials.map((testimonial, index) => {
                  const image = testimonialImages[index % testimonialImages.length];
                  return (
                    <Card key={testimonial.id} className="flex flex-col">
                      <CardContent className="pt-6 flex-grow">
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                      </CardContent>
                      <CardFooter className="flex items-center gap-4">
                        {image && (
                          <Image
                            src={image.imageUrl}
                            alt="Customer"
                            data-ai-hint={image.imageHint}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <div className="font-semibold">{testimonial.author}</div>
                      </CardFooter>
                    </Card>
                  );
                })
            ) : (
                <p className="text-center col-span-full">No reviews yet. Be the first to leave one!</p>
            )}
          </div>
        </div>
      </section>

      <Separator />

      {/* Email Signup */}
      <section className="w-full py-12 md:py-20 bg-card">
        <div className="container mx-auto text-center max-w-2xl px-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-4">Get Exclusive Deals</h2>
          <p className="text-muted-foreground mb-6">Sign up to get access to our coupons and special promotions.</p>
          <form onSubmit={handleEmailSignup} className="flex max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="rounded-r-none focus:ring-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="rounded-l-none bg-accent hover:bg-accent/90" disabled={isSubscribing}>
              {isSubscribing ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
