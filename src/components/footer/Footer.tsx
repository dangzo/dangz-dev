import siteMetadata from '@/data/siteMetadata';
import Icon from '@/components/icons/Icon';

export default function Footer() {
  return (
    <footer>
      <div className="mt-16 mb-4 flex flex-col items-center">
        <div className="mb-3 flex space-x-4">
          <Icon icon="mail" href={`mailto:${siteMetadata.email}`} size={6} />
          <Icon icon="github" href={siteMetadata.github} size={6} />
          <Icon icon="linkedin" href={siteMetadata.linkedin} size={6} />
        </div>
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{' • '}</div>
          <div>{siteMetadata.author}</div>
        </div>
      </div>
    </footer>
  );
}
