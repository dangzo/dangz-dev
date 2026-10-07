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
        <span className="block text-2xl lg:text-4xl">
          I help teams ship reliable frontend products.
        </span>
      </Heading>

      <Text size="large">
        Over the last { devYears } years, I&apos;ve &#32; worked across freelance, full-stack, and senior frontend roles, working with teams to architect, build, and plan features, bringing projects from idea to concept.
      </Text>

      <Text size="large">
        My proficiency spans <strong className="text-accent-dark">JavaScript</strong>,
        <strong className="text-accent-dark">&nbsp;React</strong>,
        <strong className="text-accent-dark">&nbsp;Vue</strong>,
        <strong className="text-accent-dark">&nbsp;TypeScript</strong> and
        <strong className="text-accent-dark">&nbsp;AI tools</strong>, which I use daily in my engineering workflow, but I&apos;m always exploring new technologies and approaches to stay up-to-date with the latest trends.
      </Text>

      <Text size="large">
        I specialize in building frontend applications that are performant, accessible, and maintainable, with a focus on delivering high-quality user experiences.
      </Text>
      <IntroCTAs />
    </section>
  );
}

export default IntroTextAndCTAs;
