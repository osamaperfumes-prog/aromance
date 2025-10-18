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
  price: number;
  discount: number; // Percentage
  imageId: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type Testimonial = {
  author: string;
  quote: string;
  rating: number; // 1-5
  imageId: string;
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
