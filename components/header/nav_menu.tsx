"use client"

import { GitHubLogoIcon } from '@radix-ui/react-icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { clsx } from 'clsx';
import NextLink from 'next/link';

export function NavbarLink({
  href,
  children,
  target,
}: {
  href: string;
  children: React.ReactNode;
  target?: string;
}) {
  return (
    <NextLink
      href={href}
      className="font-robotoMono px-0 text-center text-base font-normal text-white no-underline"
      target={target}
    >
      {children}
    </NextLink>
  );
}

function Navbar() {
  return (
    <ul className="hidden items-center justify-start gap-8 md:flex">
      <li className="flex">
        <NavbarLink href="https://github.com/coinbase/build-onchain-apps" target="_blank">
          <GitHubLogoIcon width="24" height="24" />
        </NavbarLink>
      </li>
      <li className="flex">
        <NavbarLink href="/#get-started">Get Started</NavbarLink>
      </li>
      <li className="flex">
        <NavigationMenu.Root className="relative">
          <NavigationMenu.List className={clsx('flex flex-row space-x-2')}>Create New</NavigationMenu.List>
        </NavigationMenu.Root>
      </li>
    </ul>
  );
}

export default Navbar;
