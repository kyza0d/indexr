
import React from 'react';
import { GitHubLogoIcon, UploadIcon } from '@radix-ui/react-icons';
import { Button } from 'components/ui/button';
import { Separator } from "components/ui/separator"

const Header = () => {
  return (
    <header className="border-b-slate-800 border-b w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="-ml-2 mr-2 flex items-center md:hidden">
              {/* Mobile menu button */}
            </div>
            <div className="flex-shrink-0 flex items-center">
              <GitHubLogoIcon className="h-8 w-8" />
              <Button className='font-mono' variant="link">Indexr <Separator className='mx-2' orientation='vertical' /> <b>v0.0.1</b></Button>
            </div>
            <div className="flex md:ml-2 items-center">
              <Button variant="link" size="sm">
                Dashboard
              </Button>
              <Button variant="link" size="sm">
                Documentation
              </Button>
              <Button variant="link" size="sm">
                Examples
              </Button>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Button type="button" variant="outline">
                <UploadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create new
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
