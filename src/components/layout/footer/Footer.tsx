import { author } from '@/data/siteMetadata';
import { BUILD_SEMVER, BUILD_YEAR } from '@/data/buildVersion';
import SocialIcons from './SocialIcons';

export default async function Footer() {
  return (
    <footer>
      <div className="mt-8 pt-8 border-t sm:border-0 mb-4 sm:mb-0 flex flex-col items-center">
        <SocialIcons />
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{`© ${BUILD_YEAR}`}</div>
          <div>&bull;</div>
          <div>{author}</div>
          <div>&bull;</div>
          <div>v{BUILD_SEMVER}</div>
        </div>
      </div>
    </footer>
  );
}
