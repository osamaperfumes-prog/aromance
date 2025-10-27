import type { Category, Product, Testimonial, FooterLink, NavLink, TrustBadge, InfoSection, AromanceFactorPoint } from './types';
import { Award, Bot, CheckCircle, Lock, Package, PackageCheck, Send, ShieldCheck, ShoppingBag, Truck, Facebook, Instagram } from 'lucide-react';
import { WhatsappIcon } from '@/components/WhatsappIcon';

export const navLinks: NavLink[] = [
  { name: 'Travel Size', href: '/products' },
  { name: 'Samples', href: '/products' },
  { name: 'Perfume', href: '/products' },
];

export const trustBadges: TrustBadge[] = [
  { text: 'Delivery to Abdali Mall', icon: Send },
];

export const categories: Category[] = [
  { title: 'Travel Size', description: 'Perfect for on-the-go.', imageId: 'shop-by-type-2' },
  { title: 'Gift Sets', description: 'Beautifully packaged for any occasion.', imageId: 'shop-by-type-3' },
  { title: 'Samples', description: 'Discover your new favorite scent.', imageId: 'shop-by-type-4' },
];

export const newArrivals: Product[] = [
  { id: '1', name: 'Eros', brand: 'Versace', description: 'A vibrant and glowing fragrance with a fresh, woody, and slightly oriental scent.', price: 96.00, discount: 40, imageId: 'product-1', category: 'Perfume' },
  { id: '2', name: 'Sauvage', brand: 'Dior', description: 'A radically fresh composition, dictated by a name that has the ring of a manifesto.', price: 120.00, discount: 25, imageId: 'product-2', category: 'Perfume' },
  { id: '3', name: 'Light Blue', brand: 'Dolce & Gabbana', description: 'A fresh, floral-fruity scent that captures the essence of a Sicilian summer.', price: 112.00, discount: 50, imageId: 'product-3', category: 'Perfume' },
  { id: '4', name: 'Acqua Di Gio', brand: 'Giorgio Armani', description: 'The scent of freedom, full of wind and water. A perfect harmony of sweet and salty notes of sea water.', price: 98.00, discount: 30, imageId: 'product-4', category: 'Perfume' },
  { id: '5', name: 'CK One', brand: 'Calvin Klein', description: 'A clean and contemporary fragrance with a refreshing green tea signature throughout.', price: 65.00, discount: 60, imageId: 'product-5', category: 'Samples' },
  { id: '6', name: 'Bloom', brand: 'Gucci', description: 'A rich white floral scent that transports to a vast garden filled with an abundance of flowers.', price: 145.00, discount: 20, imageId: 'product-6', category: 'Gift Sets' },
  { id: '7', name: 'White Tea', brand: 'Elizabeth Arden', description: 'A crisp and vibrant floral fragrance that captures the spirit of a serene moment.', price: 56.00, discount: 15, imageId: 'product-7', category: 'Travel Size' },
  { id: '8', name: 'Good Girl', brand: 'Carolina Herrera', description: 'A powerful and sensual fragrance. An audacious blend of dark and light elements.', price: 130.00, discount: 35, imageId: 'product-8', category: 'Perfume' },
];

export const testimonials: Testimonial[] = [
  { author: 'Jessica P.', quote: 'Amazing prices and super fast shipping! I found my favorite discontinued perfume here.', rating: 5, imageId: 'testimonial-1' },
  { author: 'Mike R.', quote: '100% authentic, I compared it with my store-bought bottle. Will definitely buy again.', rating: 5, imageId: 'testimonial-2' },
  { author: 'Sarah L.', quote: 'The gift set was beautifully packaged and arrived on time for my sister\'s birthday. She loved it!', rating: 5, imageId: 'testimonial-3' },
  { author: 'David C.', quote: 'Great selection of niche fragrances. The customer service was also very helpful.', rating: 4, imageId: 'testimonial-4' },
];

export const rewards: InfoSection = {
  title: 'Aromance Rewards',
  description: 'Earn 1 point for every dollar you spend. Redeem your points for exclusive discounts on future purchases.',
  cta: 'Join Rewards',
  icon: Award,
};

export const wholesale: InfoSection = {
  title: 'Wholesale Program',
  description: 'Are you a reseller? Register for our wholesale program to get access to bulk pricing and special offers.',
  cta: 'Register for Wholesale',
  icon: ShoppingBag,
};

const aromanceFactorPoints: AromanceFactorPoint[] = [
    { title: 'Authenticity Guaranteed', description: 'We only sell 100% genuine products from trusted brands.', icon: ShieldCheck },
    { title: 'Hassle-Free Returns', description: 'Not satisfied? We offer a simple return policy for a full refund.', icon: PackageCheck },
    { title: 'Secure Shopping', description: 'Your data is protected with state-of-the-art security.', icon: Lock },
];

export const aromanceFactor: InfoSection & { points: AromanceFactorPoint[] } = {
  title: 'The Aromance Factor',
  description: 'Why shop with us?',
  cta: '',
  icon: Bot,
  points: aromanceFactorPoints
};


export const footerLinks: FooterLink[] = [
  {
    title: 'Customer Service',
    links: [
      { name: 'Contact Us', href: '#' },
    ],
  },
  {
    title: 'About Aromance',
    links: [
      { name: 'About Us', href: '#' },
      { name: 'Admin', href: '/admin' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { name: 'New Arrivals', href: '#' },
      { name: 'Best Sellers', href: '#' },
      { name: 'Brands', href: '#' },
    ],
  },
];

export const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'WhatsApp', href: 'https://wa.me/18005551234', icon: WhatsappIcon },
]
