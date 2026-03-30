import { Button, Heading, Link, Text } from '@/components/ui';
import siteMetadata from '@/data/siteMetadata';

const strengths = [
  {
    title: 'I Start From The User',
    description: 'The best frontend work starts with empathy. I like turning product ideas into interfaces that feel simple, clear, and trustworthy.',
  },
  {
    title: 'I Enjoy Complex Problems',
    description: 'From energy platforms to DevOps tools, I have spent years shaping data-heavy products into experiences people can navigate with confidence.',
  },
  {
    title: 'I Care About Team Health',
    description: 'Good software comes from good collaboration. I invest in mentoring, thoughtful code reviews, and onboarding that helps people grow fast.',
  },
];

const skills = [
  'React 18+, Vue (Composition API), Nuxt, TypeScript, JavaScript (ES6+)',
  'Redux, Zustand, Jotai, Pinia, Vuex',
  'Storybook, Vite, Webpack, component-driven development',
  'GraphQL, REST, Highcharts, AgGrid',
  'Jest, Testing Library, Cypress (E2E)',
  'Tailwind, SASS, Figma, design systems, Agile workflows',
];

const experience = [
  {
    role: 'Senior Frontend Engineer',
    company: 'Granular Energy',
    period: 'Apr 2023 - Aug 2025',
    summary: 'I led end-to-end delivery across multiple applications, from architecture to release. I also focused on improving developer experience through refactoring, stronger tests, and mentorship.',
  },
  {
    role: 'Senior Frontend Developer',
    company: 'Cycloid',
    period: 'Aug 2019 - Apr 2023',
    summary: 'This was a key chapter in my growth: I shipped complex features, pushed component-driven practices with Storybook, and actively contributed to hiring and team onboarding.',
  },
  {
    role: 'Full-Stack Developer',
    company: 'Saavu',
    period: 'Nov 2018 - Jul 2019',
    summary: 'Working in a small team taught me speed and ownership. I built core modules across frontend and backend while keeping performance and testing front and center. TDD, clean code and architecture, and close collaboration with the CEO were daily practices that shaped my approach to product engineering.',
  },
  {
    role: 'Full-Stack Developer',
    company: '33 Mile Radius',
    period: 'Dec 2015 - Oct 2018',
    summary: 'I owned the full lifecycle of web and mobile products, from shipping new features to maintaining production systems and supporting marketing websites. I helped them build their main product - a hybrid mobile/desktop reviews generation app.',
  },
  {
    role: 'Freelance JavaScript Developer',
    company: 'Upwork',
    period: 'Jan 2015 - Nov 2015',
    summary: 'Freelancing sharpened my adaptability. I worked with different industries and stacks, delivering React frontends, full-stack features on Node.js, and custom WordPress work.',
  },
  {
    role: 'Earlier Roles',
    company: '(condensed)',
    period: '2013 - 2015',
    summary: 'Backend and game development roles using Node.js, RabbitMQ, Oracle and Postgres DBs, C#, Unity, and TypeScript. Delivered enterprise modules, internal tools, and a Microsoft-compatible 3D educational game.',
  },
];

export default async function AboutPage() {
  return (
    <article className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <section className="mb-16 md:mb-20">
        <Text size="small" className="uppercase tracking-[0.2em] font-semibold text-primary-500 dark:text-primary-300">
          About
        </Text>

        <Heading as="h1" className="max-w-4xl mb-6">
          <span className="block text-4xl md:text-6xl leading-loose">Hi, I'm Daniele.</span>
          <span className="block">I craft frontend solutions that help teams ship, products scale, and users love to use.</span>
        </Heading>

        <Text size="large" className="max-w-3xl">
          Over the last 13 years, I have grown from full-stack and freelance work into a senior frontend role focused
          on <Link type="accent" href="/blog/tags/react">#React</Link>, <Link type="accent" href="/blog/tags/vue">#Vue</Link> and <Link type="accent" href="/blog/tags/typescript">#TypeScript</Link>.
        </Text>

        <Text size="large" className="max-w-3xl mb-0">
          Today I work remotely from <strong>Santa Cruz de Tenerife</strong>, collaborating with distributed teams, mentoring engineers,
          and helping products move from idea to production with confidence.
        </Text>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Button to="/blog" type="primary" size="medium">
            Read the blog
          </Button>
          <Button to={siteMetadata.linkedin} type="ghost" size="medium">
            Connect on LinkedIn
          </Button>
        </div>
      </section>

      <section className="mb-16 md:mb-20">
        <Heading as="h2" className="mb-8">
          What defines my approach
        </Heading>

        <div className="grid gap-4 md:grid-cols-3">
          {strengths.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border-light/70 dark:border-border-dark/70 bg-background-secondary-light/40 dark:bg-background-secondary-dark/40 p-6"
            >
              <Heading as="h3" className="text-2xl mb-3">
                {item.title}
              </Heading>
              <Text className="mb-0">
                {item.description}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16 md:mb-20">
        <Heading as="h2" className="mb-8">
          Tools I trust
        </Heading>

        <ul className="space-y-4">
          {skills.map((skill) => (
            <li
              key={skill}
              className="rounded-xl border border-border-light/60 dark:border-border-dark/60 px-5 py-4"
            >
              <Text className="mb-0">{skill}</Text>
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
          I hold a <strong>Bachelor in Computer Engineering</strong> from the <strong>University of Rome "La Sapienza"</strong>, but most of
          what shaped me came from shipping real products with real teams.
        </Text>
        <Text className="max-w-3xl mb-4">
          My coding journey started when I was still a teenager, wondering school corridors in search of books of <strong>Pascal</strong> and <strong>BASIC</strong>. Reading about hacker news, experinting with Linux and open source, writing software of every kind.
        </Text>


        <Text className="mt-4 mb-0">
          In my free time you may find me practicing sports of different kinds: tennis, padel, calisthenics, or going for a free run.
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
