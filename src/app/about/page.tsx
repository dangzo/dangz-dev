import { Button, Heading, Link, Text } from '@/components/ui';
import { kebabCase } from 'lodash-es';
import aboutMeData from '@/data/aboutMeData';
import siteMetadata from '@/data/siteMetadata';

export default async function AboutPage() {
  const { skills, experience } = aboutMeData;

  const devYears = new Date().getFullYear() - 2013;

  return (
    <article className="mx-auto sm:py-4 md:py-12">
      <section className="mb-16 md:mb-44">
        <Text size="small" className="hidden sm:block uppercase tracking-[0.2em] font-semibold text-primary-500 dark:text-primary-300">
          About
        </Text>

        <Heading as="h1" className="max-w-3xl mb-6">
          <span className="block text-3xl md:text-4xl lg:text-6xl leading-loose">
            Hi, I'm Daniele.
          </span>
          <span className="block text-xl md:text-2xl lg:text-4xl">
            I craft frontend solutions that help teams ship and products scale.
          </span>
        </Heading>

        <Text size="large" className="max-w-3xl">
          Over the last { devYears } years, I have grown from full-stack and freelance work into a
          senior frontend role focused on&nbsp;
          <strong className="text-accent-dark">React</strong>,&nbsp;
          <strong className="text-accent-dark">Vue</strong> and&nbsp;
          <strong className="text-accent-dark">TypeScript</strong>.
        </Text>

        <Text size="large" className="max-w-3xl mb-0">
          Today I work remotely from Santa Cruz de Tenerife, collaborating with distributed teams,
          mentoring engineers, and helping products move from idea to production with confidence.
        </Text>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mt-3">
          <Button to={siteMetadata.resume} download type="primary" size="medium">
            Download my resume
          </Button>
          <Button to={siteMetadata.linkedin} type="ghost" size="medium">
            Connect on LinkedIn
          </Button>
        </div>
      </section>

      <section className="mb-8 sm:mb-16 md:mb-20">
        <Heading as="h2">
          Tools I trust
        </Heading>

        <ul className="grid gap-2 sm:gap-4 md:gap-5 md:grid-cols-2">
          {skills.map(({ items, label }) => (
            <li
              key={kebabCase(label)}
              className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 bg-background-secondary-light/70 dark:bg-background-secondary-dark/40 p-3 md:p-5"
            >
              <Heading as="h4" className="mb-4">{label}</Heading>

              <ul className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-3">
                {items.map((tool) => (
                  <li
                    key={kebabCase(`${label}-${tool.label}`)}
                    className="flex items-center gap-2 md:gap-3 rounded-xl px-2 py-2 md:px-3 md:py-3"
                  >
                    <span
                      aria-hidden="true"
                      className="
                        h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12
                        flex shrink-0 items-center justify-center rounded-lg
                        bg-white text-primary-700 dark:bg-neutral-100 dark:text-primary-200
                      "
                    >
                      {tool.icon({ height: 38, width: 38 })}
                    </span>

                    <Text size="small" className="mb-0! font-medium text-main-light dark:text-main-dark">
                      {tool.label}
                    </Text>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 sm:mb-16 md:mb-20">
        <Heading as="h2" className="mb-6 sm:mb-0!">
          My journey so far
        </Heading>

        <div className="hidden sm:block mb-4 md:mb-5 text-end">
          <Button to={siteMetadata.resume} download type="ghost" size="small">
            Download my resume
          </Button>
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
      </section>

      <section 
        className="
          rounded-2xl border border-primary-300/40 dark:border-primary-500/40 bg-primary-100/40 dark:bg-primary-900/20 p-6 md:p-8
        "
      >
        <Heading as="h2" className="mb-6 sm:mb-0!">
          Beyond the stack
        </Heading>

        <Text className="max-w-3xl mb-4">
          I hold a Bachelor in Computer Engineering from the&nbsp;
          <strong>University of Rome "La Sapienza"</strong>, but most of
          what shaped me came from shipping real products with real teams.
        </Text>

        <Text className="max-w-3xl mb-4">
          My coding journey started when I was still a teenager, wandering school corridors in
          search of books of <strong>Pascal</strong> and <strong>BASIC</strong>, which sooner
          became of <strong>C++</strong>, <strong>JavaScript</strong> and <strong>CSS</strong>.
          Reading about hacker news, experimenting with Linux and open source, writing software
          of every kind.
        </Text>

        <Text className="mt-4 mb-0">
          In my free time you may find me practicing sport, like tennis, padel, calisthenics, or
          going for a free run.
        </Text>

        <Text className="max-w-3xl mb-6 mt-6 border-b border-border-light/60 dark:border-border-dark/60 pb-6">
          I'm fluent in <strong>English</strong>, <strong>Spanish</strong>, and&nbsp;
          <strong>Italian</strong>.
        </Text>

        <Text className="max-w-3xl mb-4">
          If you&apos;d like to talk frontend architecture, design systems,
          or product engineering, reach out via&nbsp;
          <Link href={`mailto:${siteMetadata.email}`} type="accent">email</Link>,
          connect on <Link href={siteMetadata.linkedin} type="accent">LinkedIn</Link>,
          or explore my work on{' '}
          <Link href={siteMetadata.github} type="accent">GitHub</Link>.
        </Text>
      </section>
    </article>
  );
}
