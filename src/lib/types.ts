import type { LucideIcon } from 'lucide-react';

export type NavLink = {
  name: string;
  href: string;
};

export type TrustBadge = {
  text: string;
  icon: LucideIcon;
};

export type Category = {
  title: string;
  description: string;
  imageId: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  discount: number; // Percentage
  imageUrl: string;
  category: string[];
};

export type CartItem = Product & {
  quantity: number;
};

export type Testimonial = {
  id: string;
  author: string;
  quote: string;
  rating: number; // 1-5
  orderId?: string;
  createdAt: number;
};

export type InfoSection = {
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
}

export type AromanceFactorPoint = {
    title: string;
    description: string;
    icon: LucideIcon;
}

export type FooterLink = {
  title: string;
  links: { name: string; href: string }[];
};
