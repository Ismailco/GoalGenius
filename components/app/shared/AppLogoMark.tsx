import Image from 'next/image';
import logoMark from '@/public/images/rungset-logo-mark.png';

interface AppLogoMarkProps {
  className?: string;
}

export default function AppLogoMark({ className = '' }: AppLogoMarkProps) {
  return (
    <div className={`brand-mark ${className}`}>
      <Image
        src={logoMark}
        alt="Rungset logo"
        width={30}
        height={30}
        className="h-[30px] w-[30px] object-contain"
      />
    </div>
  );
}
