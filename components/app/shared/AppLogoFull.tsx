import Image from 'next/image';
import logoFull from '@/public/images/rungset-logo-full.png';

interface AppLogoFullProps {
  className?: string;
  alt?: string;
}

export default function AppLogoFull({
  className = '',
  alt = 'Rungset',
}: AppLogoFullProps) {
  return (
    <Image
      src={logoFull}
      alt={alt}
      className={`h-auto w-auto object-contain ${className}`}
    />
  );
}
