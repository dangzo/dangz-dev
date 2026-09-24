import { Heading, Text } from '@/components/ui';
import IntroCTAs from './IntroCTAs';

const devYears = new Date().getFullYear() - 2013;

function IntroTextAndCTAs() {
  return (
    <section className="max-w-3xl mx-auto mb-10 md:mb-14">
      <Heading as="h1" className="mb-6">
        <span className="block text-3xl md:text-4xl lg:text-6xl leading-loose">
          Hi, I'm Daniele.
        </span>
        <span className="block text-xl md:text-2xl lg:text-4xl">
          I build frontend solutions that help teams ship and products scale.
        </span>
      </Heading>

      <Text size="large">
        Over the last { devYears } years, I&apos;ve moved from freelance and full-stack work into
        senior frontend roles, helping teams build reliable products with
        <strong className="text-accent-dark">&nbsp;React</strong>
        <strong className="text-accent-dark">&nbsp;Vue</strong> and
        <strong className="text-accent-dark">&nbsp;TypeScript</strong>.
      </Text>

      <Text size="large" className="mb-0">
        Today, I work remotely from Santa Cruz de Tenerife (Spain), collaborating with distributed teams,
        mentoring engineers, and helping products move from idea to production with efficiency.
      </Text>

      <IntroCTAs />
    </section>
  );
}

export default IntroTextAndCTAs;
