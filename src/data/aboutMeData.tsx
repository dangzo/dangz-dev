import Icon from '@/components/icons/Icon';

const skills = [
  {
    label: 'Frameworks & Languages',
    items: [
      { icon: ({ ...props }) => <Icon icon="html5" {...props} />, label: 'HTML5' },
      { icon: ({ ...props }) => <Icon icon="css3" {...props} />, label: 'CSS3' },
      { icon: ({ ...props }) => <Icon icon="javascript" {...props} />, label: 'JavaScript' },
      { icon: ({ ...props }) => <Icon icon="typescript" {...props} />, label: 'TypeScript' },
      { icon: ({ ...props }) => <Icon icon="react" {...props} />, label: 'React' },
      { icon: ({ ...props }) => <Icon icon="vue" {...props} />, label: 'Vue' },
      { icon: ({ ...props }) => <Icon icon="nextjs" {...props} />, label: 'Next.js' },
      { icon: ({ ...props }) => <Icon icon="nuxtjs" {...props} />, label: 'Nuxt.js' },
    ],
  },
  {
    label: 'State Management',
    items: [
      { icon: ({ ...props }) => <Icon icon="redux" {...props} />, label: 'Redux' },
      { icon: ({ ...props }) => <Icon icon="zustand" {...props} />, label: 'Zustand' },
      { icon: ({ ...props }) => <Icon icon="jotai" {...props} />, label: 'Jotai' },
      { icon: ({ ...props }) => <Icon icon="pinia" {...props} />, label: 'Pinia' },
      { icon: ({ ...props }) => <Icon icon="vue" {...props} />, label: 'Vuex' },
    ],
  },
  {
    label: 'Build Tools, Automation & Workflow',
    items: [
      { icon: ({ ...props }) => <Icon icon="vscode" {...props} />, label: 'VS Code' },
      { icon: ({ ...props }) => <Icon icon="bash" {...props} />, label: 'Bash' },
      { icon: ({ ...props }) => <Icon icon="devops" {...props} />, label: 'CI/CD pipelines' },
      { icon: ({ ...props }) => <Icon icon="vite" {...props} />, label: 'Vite' },
      { icon: ({ ...props }) => <Icon icon="webpack" {...props} />, label: 'Webpack' },
      { icon: ({ ...props }) => <Icon icon="docker" {...props} />, label: 'Docker' },
      { icon: ({ ...props }) => <Icon icon="design-components" {...props} />, label: 'Design systems' },
      { icon: ({ ...props }) => <Icon icon="agile" {...props} />, label: 'Agile workflows' },
    ],
  },
  {
    label: 'APIs & Data Visualization',
    items: [
      { icon: ({ ...props }) => <Icon icon="graphql" {...props} />, label: 'GraphQL' },
      { icon: ({ ...props }) => <Icon icon="rest" {...props} />, label: 'REST API' },
      { icon: ({ ...props }) => <Icon icon="react-query" {...props} />, label: 'React Query' },
      { icon: ({ ...props }) => <Icon icon="highcharts" {...props} />, label: 'Highcharts' },
      { icon: ({ ...props }) => <Icon icon="aggrid" {...props} />, label: 'AG Grid' },
    ],
  },
  {
    label: 'Testing, Monitoring & Quality Assurance',
    items: [
      { icon: ({ ...props }) => <Icon icon="jest" {...props} />, label: 'Jest' },
      { icon: ({ ...props }) => <Icon icon="vitest" {...props} />, label: 'Vitest' },
      { icon: ({ ...props }) => <Icon icon="testing-library" {...props} />, label: 'Testing Library' },
      { icon: ({ ...props }) => <Icon icon="cypress" {...props} />, label: 'Cypress' },
      { icon: ({ ...props }) => <Icon icon="sentry" {...props} />, label: 'Sentry' },
      { icon: ({ ...props }) => <Icon icon="datadog" {...props} />, label: 'DataDog' },
    ],
  },
  {
    label: 'Design',
    items: [
      { icon: ({ ...props }) => <Icon icon="figma" {...props} />, label: 'Figma' },
      { icon: ({ ...props }) => <Icon icon="tailwindcss" {...props} />, label: 'Tailwind CSS' },
      { icon: ({ ...props }) => <Icon icon="sass" {...props} />, label: 'SCSS, Sass' },
      { icon: ({ ...props }) => <Icon icon="materialui" {...props} />, label: 'Material UI' },
      { icon: ({ ...props }) => <Icon icon="remix" {...props} />, label: 'Remix' },
      { icon: ({ ...props }) => <Icon icon="vuetify" {...props} />, label: 'Vuetify' },
      { icon: ({ ...props }) => <Icon icon="storybook" {...props} />, label: 'Storybook' },
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