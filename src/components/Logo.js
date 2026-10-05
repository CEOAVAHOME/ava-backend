import Link from 'next/link';

export default function Logo({ href = '/' }) {
  return (
    <Link href={href} className="logo">
      <span className="logo-mark">✦</span>
      <span>
        Review<span className="gradient-text">Genius</span>
      </span>
    </Link>
  );
}
