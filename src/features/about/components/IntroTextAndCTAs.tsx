import { Heading, Text } from '@/components/ui';
import IntroCTAs from './IntroCTAs';

const devYears = new Date().getFullYear() - 2013;

function IntroTextAndCTAs() {
  return (
    <section className="max-w-3xl mx-auto mb-16 md:mb-55">
      <Heading as="h1" className="mb-6">
        <span className="block text-3xl md:text-4xl lg:text-6xl leading-loose">
          Hi, I'm Daniele.
        </span>
        <span className="block text-xl md:text-2xl lg:text-4xl">
          I craft frontend solutions that help teams ship and products scale.
        </span>
      </Heading>

      <Text size="large">
        Over the last { devYears } years, I&apos;ve moved from freelance and full-stack work into
        senior frontend roles, helping teams build reliable products with&nbsp;
        <strong className="text-accent-dark">React</strong>,&nbsp;
        <strong className="text-accent-dark">Vue</strong> and&nbsp;
        <strong className="text-accent-dark">TypeScript</strong>.
      </Text>

      <Text size="large" className="mb-0">
        Today, I work remotely from Santa Cruz de Tenerife (Spain), collaborating with distributed teams,
        mentoring engineers, and helping products move from idea to production with confidence.
      </Text>

      <IntroCTAs />
    </section>
  );
}

export default IntroTextAndCTAs;