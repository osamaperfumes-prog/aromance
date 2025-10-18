import { ProductCard } from '@/components/ProductCard';
import { newArrivals } from '@/lib/data';

export default function ProductsPage() {
  return (
    <div className="bg-card">
      <div className="container mx-auto py-12 md:py-20">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">All Fragrances</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">Discover your signature scent from our curated collection.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...newArrivals, ...newArrivals.slice(0,4)].map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} product={{...product, id: `${product.id}-${index}`}} />
          ))}
        </div>
      </div>
    </div>
  );
}
