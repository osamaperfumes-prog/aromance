import Link from 'next/link';
import { AromanceLogo } from '@/components/AromanceLogo';
import { footerLinks, socialLinks } from '@/lib/data';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <AromanceLogo className="text-primary-foreground" inHeader={false} />
            <p className="mt-4 text-sm text-primary-foreground/70">
              The world of fragrance, delivered to your door.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} className="text-primary-foreground/70 hover:text-primary-foreground">
                  <span className="sr-only">{social.name}</span>
                  <social.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold tracking-wider uppercase">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/70">
          <p>&copy; {new Date().getFullYear()} Aromance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
