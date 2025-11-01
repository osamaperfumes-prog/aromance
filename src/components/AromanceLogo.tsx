import Link from 'next/link';
import { cn } from '@/lib/utils';

const PerfumeBottleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16 7.5V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2.5a.5.5 0 00.5.5h3a.5.5 0 00.5-.5z" />
    <path
      fillRule="evenodd"
      d="M11 9H7a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3v-6a3 3 0 00-3-3h-4zm-2 2a1 1 0 100 2h8a1 1 0 100-2H9z"
      clipRule="evenodd"
    />
  </svg>
);

export const DnaLogo = ({ className, inHeader = true }: { className?: string, inHeader?: boolean }) => {
  const Comp = inHeader ? 'h1' : 'div';
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-primary", className)}>
      <PerfumeBottleIcon className="h-8 w-8 text-primary" />
      <Comp className="text-3xl font-bold tracking-tighter">DNA</Comp>
    </Link>
  );
};
