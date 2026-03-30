'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
  useUser,
} from '@clerk/nextjs';

const navItems = [
  {
    label: 'Library',
    href: '/',
  },
  {
    label: 'Add New',
    href: '/books/new',
  },
  {
    label: 'Pricing',
    href: '/subscriptions',
  },
];

function Navbar() {
  const pathName = usePathname();
  const { user } = useUser();
  return (
    <header className="fixed top-0 right-0 left-0 z-50 w-full bg-(--bg-primary)">
      <div className="wrapper navbar-height flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-0.5">
          <Image
            src="/assets/logo.png"
            alt="Bookified"
            width={42}
            height={26}
          />
          <span className="text-xl font-bold">Bookified</span>
        </Link>
        <nav className="flex w-fit items-center gap-7.5">
          {navItems.map(({ label, href }) => {
            const isActive =
              href === '/' ? pathName === '/' : pathName.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'nav-link-base',
                  isActive ? 'nav-link-active' : 'text-black hover:opacity-70'
                )}
              >
                {label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="hover:cursor-pointer">Sign in</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
              {user?.firstName && (
                <span className="nav-user-name">
                  {user.fullName || user.firstName}
                </span>
              )}
            </Show>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
