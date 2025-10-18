import type { Category, Product, Testimonial, FooterLink, NavLink, TrustBadge, InfoSection, AromanceFactorPoint } from './types';
import { Award, Bot, CheckCircle, Lock, Package, PackageCheck, Send, ShieldCheck, ShoppingBag, Truck, Facebook, Instagram } from 'lucide-react';
import { WhatsappIcon } from '@/components/WhatsappIcon';

export const navLinks: NavLink[] = [
  { name: 'Testers', href: '/products' },
  { name: 'Travel Size', href: '/products' },
  { name: 'Samples', href: '/products' },
  { name: 'Perfume', href: '/products' },
];

export const trustBadges: TrustBadge[] = [
  { text: 'Delivery to Abdali Mall', icon: Send },
];

export const categories: Category[] = [
  { title: 'Testers', description: 'Full-size fragrances without the fancy packaging.', imageId: 'shop-by-type-1' },
  { title: 'Travel Size', description: 'Perfect for on-the-go.', imageId: 'shop-by-type-2' },
  { title: 'Gift Sets', description: 'Beautifully packaged for any occasion.', imageId: 'shop-by-type-3' },
  { title: 'Samples', description: 'Discover your new favorite scent.', imageId: 'shop-by-type-4' },
];

export const newArrivals: Product[] = [
  { id: '1', name: 'Eros', brand: 'Versace', price: 96.00, discount: 40, imageId: 'product-1' },
  { id: '2', name: 'Sauvage', brand: 'Dior', price: 120.00, discount: 25, imageId: 'product-2' },
  { id: '3', name: 'Light Blue', brand: 'Dolce & Gabbana', price: 112.00, discount: 50, imageId: 'product-3' },
  { id: '4', name: 'Acqua Di Gio', brand: 'Giorgio Armani', price: 98.00, discount: 30, imageId: 'product-4' },
  { id: '5', name: 'CK One', brand: 'Calvin Klein', price: 65.00, discount: 60, imageId: 'product-5' },
  { id: '6', name: 'Bloom', brand: 'Gucci', price: 145.00, discount: 20, imageId: 'product-6' },
  { id: '7', name: 'White Tea', brand: 'Elizabeth Arden', price: 56.00, discount: 15, imageId: 'product-7' },
  { id: '8', name: 'Good Girl', brand: 'Carolina Herrera', price: 130.00, discount: 35, imageId: 'product-8' },
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
