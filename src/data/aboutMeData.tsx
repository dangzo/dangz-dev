import {
  ReactOriginalIcon,
  VuejsOriginalIcon,
  TypescriptOriginalIcon,
  JavascriptOriginalIcon,
  NextjsOriginalIcon,
  NuxtjsOriginalIcon,
  ReduxOriginalIcon,
  StorybookOriginalIcon,
  WebpackOriginalIcon,
  DockerOriginalIcon,
  JestPlainIcon,
  TailwindcssOriginalIcon,
  SassOriginalIcon,
  FigmaOriginalIcon,
  CypressioOriginalIcon,
  VitestOriginalIcon,
  Html5OriginalIcon,
  Css3OriginalIcon,
  GraphqlPlainIcon,
} from '@devicon/react';

const skills = [
  {
    label: 'Frameworks & Languages',
    items: [
      { icon: () => <Html5OriginalIcon size="38px" />, label: 'HTML5' },
      { icon: () => <Css3OriginalIcon size="38px" />, label: 'CSS3' },
      { icon: () => <JavascriptOriginalIcon size="38px" />, label: 'JavaScript' },
      { icon: () => <TypescriptOriginalIcon size="38px" />, label: 'TypeScript' },
      { icon: () => <ReactOriginalIcon size="38px" />, label: 'React' },
      { icon: () => <VuejsOriginalIcon size="38px" />, label: 'Vue' },
      { icon: () => <NextjsOriginalIcon size="38px" />, label: 'Next.js' },
      { icon: () => <NuxtjsOriginalIcon size="38px" />, label: 'Nuxt.js' },
    ],
  },
  {
    label: 'State Management',
    items: [
      { icon: () => <ReduxOriginalIcon size="38px" />, label: 'Redux' },
      { icon: null, label: 'Zustand' },
      { icon: null, label: 'Jotai' },
      { icon: null, label: 'Pinia' },
      { icon: null, label: 'Vuex' },
    ],
  },
  {
    label: 'Build Tools & Component Development',
    items: [
      { icon: () => <StorybookOriginalIcon size="38px" />, label: 'Storybook' },
      { icon: null, label: 'Vite' },
      { icon: () => <WebpackOriginalIcon size="38px" />, label: 'Webpack' },
      { icon: () => <DockerOriginalIcon size="38px" />, label: 'Docker' },
      { icon: null, label: 'CI/CD pipelines' },
    ],
  },
  {
    label: 'APIs & Data Visualization',
    items: [
      { icon: () => <GraphqlPlainIcon size="38px" />, label: 'GraphQL' },
      { icon: () => <ReactOriginalIcon size="38px" />, label: 'REST' },
      { icon: () => <ReactOriginalIcon size="38px" />, label: 'React Query' },
      { icon: null, label: 'Highcharts' },
      { icon: null, label: 'AG Grid' },
    ],
  },
  {
    label: 'Testing & Quality Assurance',
    items: [
      { icon: () => <JestPlainIcon size="38px" />, label: 'Jest' },
      { icon: () => <VitestOriginalIcon size="38px" />, label: 'Vitest' },
      { icon: null, label: 'Testing Library' },
      { icon: () => <CypressioOriginalIcon size="38px" />, label: 'Cypress' },
    ],
  },
  {
    label: 'Design & Workflow',
    items: [
      { icon: () => <TailwindcssOriginalIcon size="38px" />, label: 'Tailwind CSS' },
      { icon: () => <SassOriginalIcon size="38px" />, label: 'SCSS, Sass' },
      { icon: null, label: 'CSS-in-JS' },
      { icon: () => <FigmaOriginalIcon size="38px" />, label: 'Figma' },
      { icon: null, label: 'Design systems' },
      { icon: null, label: 'Agile workflows' },
    ],
  },
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


const aboutMeData = {
  skills,
  experience,
};

export default aboutMeData;