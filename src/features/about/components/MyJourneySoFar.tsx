import { Heading, Text } from '@/components/ui';
import aboutMeData from '@/features/about/data/aboutMeData';
import ResumeDownloadButton from './ResumeDownloadButton';

const { experience } = aboutMeData;

function MyJourneySoFar() {
  return (
    <div className="mb-8 sm:mb-16 md:mb-20">
      <Heading as="h2" className="mb-6 sm:mb-0!">
        My journey so far
      </Heading>

      <div className="hidden sm:block mb-4 md:mb-5 text-end">
        <ResumeDownloadButton />
      </div>

      <div className="space-y-2 sm:space-y-4">
        {experience.map((item) => (
          <div
            key={`${item.company}-${item.period}`}
            className="rounded-xl border border-border-light/60 dark:border-border-dark/60 p-4 md:p-5"
          >
            <Heading as="h3">
              <span className="block sm:inline">{item.role}</span>
              <span className="hidden sm:inline"> - </span>
              <span className="block sm:inline text-primary-600 dark:text-primary-400">{item.company}</span>
            </Heading>
            <Text
              size="x-small"
              className="font-semibold text-primary-500 dark:text-primary-300 mb-3 uppercase tracking-wide"
            >
              {item.period}
            </Text>
            <Text className="mb-0">{item.summary}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyJourneySoFar;