import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const DnaLogo = ({ className, inHeader = true }: { className?: string, inHeader?: boolean }) => {
  const Comp = inHeader ? 'h1' : 'div';
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-primary", className)}>
      <Image
        src="https://ik.imagekit.io/74zo8wkyp/20251102-001112-removebg-preview.png?updatedAt=1762031545891"
        alt="DNA Logo"
        width={150}
        height={150}
        className="object-contain"
      />
    </Link>
  );
};
