import { Heading, Text } from '@/components/ui';

function BeyondTheStack() {
  return (
    <section
      className="
        mb-8
        rounded-2xl border border-border-light/70 bg-background-secondary-light/50 p-6
        dark:border-border-dark/60 dark:bg-background-secondary-dark/30 md:p-8
      "
    >
      <Heading as="h2">
        Beyond the stack
      </Heading>

      <Text className="mb-4">
        I hold a Bachelor in Computer Engineering from the&nbsp;
        <strong>University of Rome "La Sapienza"</strong>, but most of
        what shaped me came from shipping real products with real teams.
      </Text>

      <Text className="mb-4">
        My coding journey started when I was still a teenager, wandering school corridors in
        search of books of <strong>Pascal</strong> and <strong>BASIC</strong>, which sooner
        became of <strong>C++</strong>, <strong>JavaScript</strong> and <strong>CSS</strong>.
        Reading about hacker news, experimenting with Linux and open source, writing software
        of every kind.
      </Text>

      <Text className="mt-4 mb-0">
        In my free time there's a good chance you may find me practicing sport (<em>tennis, padel, calisthenics</em>), playing board games with friends, or eating some delicious food (<em>Italian DNA, remember</em>).
      </Text>

      <Text className="mb-6 mt-6">
        I'm fluent in <strong>English</strong>, <strong>Spanish</strong>, and&nbsp;
        <strong>Italian</strong>.
      </Text>
    </section>
  );
}

export default BeyondTheStack;