import type { Category, FooterLink, NavLink, TrustBadge, InfoSection, AromanceFactorPoint } from './types';
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

export const rewards: InfoSection = {
  title: 'DNA Rewards',
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
  title: 'The DNA Factor',
  description: 'Why shop with us?',
  cta: '',
  icon: Bot,
  points: aromanceFactorPoints
};


export const footerLinks: FooterLink[] = [
  {
    title: 'Customer Service',
    links: [
      { name: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'About DNA',
    links: [
      { name: 'About Us', href: '#' },
      { name: 'Admin', href: '/admin' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { name: 'New Arrivals', href: '#' },
      { name: 'Brands', href: '#' },
    ],
  },
];


export const socialLinksConfig = [
  { name: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/your-page' },
  { name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/your-username' },
  { name: 'WhatsApp', icon: WhatsappIcon, placeholder: 'https://wa.me/1234567890' },
];
