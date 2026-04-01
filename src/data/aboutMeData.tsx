import Icon from '@/components/icons/Icon';

const skills = [
  {
    label: 'Frameworks & Languages',
    items: [
      { icon: () => <Icon icon="html5" size={32} />, label: 'HTML5' },
      { icon: () => <Icon icon="css3" size={32} />, label: 'CSS3' },
      { icon: () => <Icon icon="javascript" size={32} />, label: 'JavaScript' },
      { icon: () => <Icon icon="typescript" size={32} />, label: 'TypeScript' },
      { icon: () => <Icon icon="react" size={32} />, label: 'React' },
      { icon: () => <Icon icon="vue" size={32} />, label: 'Vue' },
      { icon: () => <Icon icon="nextjs" size={32} />, label: 'Next.js' },
      { icon: () => <Icon icon="nuxtjs" size={32} />, label: 'Nuxt.js' },
    ],
  },
  {
    label: 'State Management',
    items: [
      { icon: () => <Icon icon="redux" size={32} />, label: 'Redux' },
      { icon: () => <Icon icon="zustand" size={32} />, label: 'Zustand' },
      { icon: () => <Icon icon="jotai" size={32} />, label: 'Jotai' },
      { icon: () => <Icon icon="pinia" size={32} />, label: 'Pinia' },
      { icon: () => <Icon icon="vue" size={32} />, label: 'Vuex' },
    ],
  },
  {
    label: 'Build Tools, Automation & Workflow',
    items: [
      { icon: () => <Icon icon="vscode" size={32} />, label: 'VS Code' },
      { icon: () => <Icon icon="bash" size={32} />, label: 'Bash' },
      { icon: () => <Icon icon="devops" size={32} />, label: 'CI/CD pipelines' },
      { icon: () => <Icon icon="vite" size={32} />, label: 'Vite' },
      { icon: () => <Icon icon="webpack" size={32} />, label: 'Webpack' },
      { icon: () => <Icon icon="docker" size={32} />, label: 'Docker' },
      { icon: () => <Icon icon="design-components" size={32} />, label: 'Design systems' },
      { icon: () => <Icon icon="agile" size={32} />, label: 'Agile workflows' },
    ],
  },
  {
    label: 'APIs & Data Visualization',
    items: [
      { icon: () => <Icon icon="graphql" size={32} />, label: 'GraphQL' },
      { icon: () => <Icon icon="rest" size={32} />, label: 'REST API' },
      { icon: () => <Icon icon="react-query" size={32} />, label: 'React Query' },
      { icon: () => <Icon icon="highcharts" size={32} />, label: 'Highcharts' },
      { icon: () => <Icon icon="aggrid" size={32} />, label: 'AG Grid' },
    ],
  },
  {
    label: 'Testing, Monitoring & Quality Assurance',
    items: [
      { icon: () => <Icon icon="jest" size={32} />, label: 'Jest' },
      { icon: () => <Icon icon="vitest" size={32} />, label: 'Vitest' },
      { icon: () => <Icon icon="testing-library" size={32} />, label: 'Testing Library' },
      { icon: () => <Icon icon="cypress" size={32} />, label: 'Cypress' },
      { icon: () => <Icon icon="sentry" size={32} />, label: 'Sentry' },
      { icon: () => <Icon icon="datadog" size={32} />, label: 'DataDog' },
    ],
  },
  {
    label: 'Design',
    items: [
      { icon: () => <Icon icon="figma" size={32} />, label: 'Figma' },
      { icon: () => <Icon icon="tailwindcss" size={32} />, label: 'Tailwind CSS' },
      { icon: () => <Icon icon="sass" size={32} />, label: 'SCSS, Sass' },
      { icon: () => <Icon icon="materialui" size={32} />, label: 'Material UI' },
      { icon: () => <Icon icon="remix" size={32} />, label: 'Remix' },
      { icon: () => <Icon icon="vuetify" size={32} />, label: 'Vuetify' },
      { icon: () => <Icon icon="storybook" size={32} />, label: 'Storybook' },
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