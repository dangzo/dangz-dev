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
          I help teams ship reliable frontend products.
        </span>
      </Heading>

      <Text size="large">
        Over the last { devYears } years, I&apos;ve &#32; worked across freelance, full-stack, and senior frontend roles. I work mainly with
        <strong className="text-accent-dark">&nbsp;React</strong>,
        <strong className="text-accent-dark">&nbsp;Vue</strong>,
        <strong className="text-accent-dark">&nbsp;TypeScript</strong> and
        <strong className="text-accent-dark">&nbsp;AI tools</strong> in my day-to-day engineering workflow.
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
