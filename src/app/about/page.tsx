import { Button, Heading, Link, Text } from '@/components/ui';
import { kebabCase } from 'lodash-es';
import aboutMeData from '@/data/aboutMeData';
import siteMetadata from '@/data/siteMetadata';

const getPlaceholderIconText = (tool: string) => {
  const words = tool
    .replace(/[()./]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};


export default async function AboutPage() {
  const { skills, experience } = aboutMeData;

  const devYears = new Date().getFullYear() - 2013;

  return (
    <article className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <section className="mb-16 md:mb-44">
        <Text size="small" className="uppercase tracking-[0.2em] font-semibold text-primary-500 dark:text-primary-300">
          About
        </Text>

        <Heading as="h1" className="max-w-4xl mb-6">
          <span className="block text-4xl md:text-6xl leading-loose">Hi, I'm Daniele.</span>
          <span className="block">I craft frontend solutions that help teams ship and products scale.</span>
        </Heading>

        <Text size="large" className="max-w-3xl">
          Over the last { devYears } years, I have grown from full-stack and freelance work into a senior frontend role focused
          on <strong className="text-accent-dark">React</strong>, <strong className="text-accent-dark">Vue</strong> and <strong className="text-accent-dark">TypeScript</strong>.
        </Text>

        <Text size="large" className="max-w-3xl mb-0">
          Today I work remotely from Santa Cruz de Tenerife, collaborating with distributed teams, mentoring engineers,
          and helping products move from idea to production with confidence.
        </Text>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Button to={siteMetadata.resume} download type="primary" size="medium">
            Download my resume
          </Button>
          <Button to={siteMetadata.linkedin} type="ghost" size="medium">
            Connect on LinkedIn
          </Button>
        </div>
      </section>

      <section className="mb-16 md:mb-20">
        <Heading as="h2" className="mb-8">
          Tools I trust
        </Heading>

        <ul className="grid gap-5 md:grid-cols-2">
          {skills.map(({ items, label }) => (
            <li
              key={kebabCase(label)}
              className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 bg-background-secondary-light/70 dark:bg-background-secondary-dark/40 p-5"
            >
              <Heading as="h4" className="mb-4">{label}</Heading>

              <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {items.map((tool) => (
                  <li
                    key={kebabCase(`${label}-${tool.label}`)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold tracking-wide text-primary-700 dark:bg-primary-100 dark:text-primary-200"
                    >
                      {tool.icon ? tool.icon() : getPlaceholderIconText(tool.label)}
                    </span>

                    <Text size="small" className="mb-0 font-medium text-main-light dark:text-main-dark">
                      {tool.label}
                    </Text>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-16 md:mb-20">
        <Heading as="h2" className="mb-8">
          My journey so far
        </Heading>

        <div className="space-y-4">
          {experience.map((item) => (
            <div
              key={`${item.company}-${item.period}`}
              className="rounded-xl border border-border-light/60 dark:border-border-dark/60 p-5"
            >
              <Heading as="h3" className="text-2xl mb-2">
                {item.role} - {item.company}
              </Heading>
              <Text size="small" className="font-semibold text-primary-500 dark:text-primary-300 mb-3 uppercase tracking-wide">
                {item.period}
              </Text>
              <Text className="mb-0">{item.summary}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-primary-300/40 dark:border-primary-500/40 bg-primary-100/40 dark:bg-primary-900/20 p-6 md:p-8">
        <Heading as="h2" className="mb-4">
          Beyond the stack
        </Heading>

        <Text className="max-w-3xl mb-4">
          I hold a Bachelor in Computer Engineering from the <strong>University of Rome "La Sapienza"</strong>, but most of
          what shaped me came from shipping real products with real teams.
        </Text>

        <Text className="max-w-3xl mb-4">
          My coding journey started when I was still a teenager, wandering school corridors in search of books of <strong>Pascal</strong> and <strong>BASIC</strong>, which sooner became of <strong>C++</strong>, <strong>JavaScript</strong> and <strong>CSS</strong>. Reading about hacker news, experinting with Linux and open source, writing software of every kind.
        </Text>

        <Text className="mt-4 mb-0">
          In my free time you may find me practicing sport, like tennis, padel, calisthenics, or going for a free run.
        </Text>

        <Text className="max-w-3xl mb-6 mt-6 border-b border-border-light/60 dark:border-border-dark/60 pb-6">
          I'm fluent in <strong>English</strong>, <strong>Spanish</strong>, and <strong>Italian</strong>.
        </Text>

        <Text className="max-w-3xl mb-4">
          If you&apos;d like to talk frontend architecture, design systems,
          or product engineering, reach out via <Link href={`mailto:${siteMetadata.email}`} type="accent">email</Link>,
          connect on <Link href={siteMetadata.linkedin} type="accent">LinkedIn</Link>, or explore my work on{' '}
          <Link href={siteMetadata.github} type="accent">GitHub</Link>.
        </Text>
      </section>
    </article>
  );
}
