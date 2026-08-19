import { author } from '@/data/siteMetadata';
import { BUILD_SEMVER } from '@/data/buildVersion';
import SocialIcons from './SocialIcons';

export default async function Footer() {
  return (
    <footer>
      <div className="mt-14 pt-14 border-t sm:border-0 mb-4 sm:mb-0 flex flex-col items-center">
        <SocialIcons />
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>&bull;</div>
          <div>{author}</div>
          <div>&bull;</div>
          <div>v{BUILD_SEMVER}</div>
        </div>
      </div>
    </footer>
  );
}
