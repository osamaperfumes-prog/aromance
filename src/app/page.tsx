import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/ProductCard';
import { aromanceFactor, categories, newArrivals, rewards, testimonials, trustBadges, wholesale } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star } from 'lucide-react';

export default function Home() {
  const testimonialImages = PlaceHolderImages.filter(img => img.id.startsWith('testimonial'));

  return (
    <div className="flex flex-col">
      {/* Trust Badges */}
      <section className="w-full bg-primary-foreground py-3">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
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
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Shop By Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const image = PlaceHolderImages.find(img => img.id === `shop-by-type-${index + 1}`);
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
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h3 className="text-2xl font-semibold text-white">{category.title}</h3>
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
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">New Arrivals</h2>
            <Button variant="link" asChild>
              <Link href="/products">See All &rarr;</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-20 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => {
              const image = testimonialImages[index % testimonialImages.length];
              return (
                <Card key={index} className="flex flex-col">
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
                        alt="Perfume bottle"
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
            })}
          </div>
        </div>
      </section>

      {/* Rewards, Wholesale, and Factor */}
      <section className="w-full py-12 md:py-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rewards */}
            <div className="space-y-4">
              <rewards.icon className="w-10 h-10 text-accent" />
              <h3 className="text-2xl font-bold text-primary">{rewards.title}</h3>
              <p className="text-muted-foreground">{rewards.description}</p>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="#">{rewards.cta}</Link>
              </Button>
            </div>
            {/* Wholesale */}
            <div className="space-y-4">
               <wholesale.icon className="w-10 h-10 text-accent" />
              <h3 className="text-2xl font-bold text-primary">{wholesale.title}</h3>
              <p className="text-muted-foreground">{wholesale.description}</p>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="#">{wholesale.cta}</Link>
              </Button>
            </div>
            {/* The Aromance Factor */}
            <div className="space-y-4">
               <aromanceFactor.icon className="w-10 h-10 text-accent" />
              <h3 className="text-2xl font-bold text-primary">{aromanceFactor.title}</h3>
              <ul className="space-y-2 text-muted-foreground">
                {aromanceFactor.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <point.icon className="w-5 h-5 mt-1 text-accent shrink-0" />
                    <span><strong>{point.title}:</strong> {point.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Email Signup */}
      <section className="w-full py-12 md:py-20 bg-card">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-4">Get Exclusive Deals</h2>
          <p className="text-muted-foreground mb-6">Sign up to get access to our coupons and special promotions.</p>
          <form className="flex max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="rounded-r-none focus:ring-accent" />
            <Button type="submit" className="rounded-l-none bg-accent hover:bg-accent/90">Sign Up</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
