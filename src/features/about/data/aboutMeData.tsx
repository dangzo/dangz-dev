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
    label: 'Testing, Monitoring & Quality Assurance',
    items: [
      { icon: ({ ...props }) => <Icon icon="jest" {...props} />, label: 'Jest' },
      { icon: ({ ...props }) => <Icon icon="vitest" {...props} />, label: 'Vitest' },
      { icon: ({ ...props }) => <Icon icon="testing-library" {...props} />, label: 'Testing Library' },
      { icon: ({ ...props }) => <Icon icon="cypress" {...props} />, label: 'Cypress' },
      { icon: ({ ...props }) => <Icon icon="playwright" {...props} />, label: 'Playwright' },
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
  {
    label: 'Data Visualization',
    items: [
      { icon: ({ ...props }) => <Icon icon="graphql" {...props} />, label: 'GraphQL' },
      { icon: ({ ...props }) => <Icon icon="react-query" {...props} />, label: 'React Query' },
      { icon: ({ ...props }) => <Icon icon="highcharts" {...props} />, label: 'Highcharts' },
      { icon: ({ ...props }) => <Icon icon="aggrid" {...props} />, label: 'AG Grid' },
    ],
  },
  {
    label: 'Tooling & Automation',
    items: [
      { icon: ({ ...props }) => <Icon icon="rest" {...props} />, label: 'REST API' },
      { icon: ({ ...props }) => <Icon icon="swagger" {...props} />, label: 'Swagger, OpenAPI' },
      { icon: ({ ...props }) => <Icon icon="vscode" {...props} />, label: 'VS Code' },
      { icon: ({ ...props }) => <Icon icon="nodejs" {...props} />, label: 'Node.js' },
      { icon: ({ ...props }) => <Icon icon="vite" {...props} />, label: 'Vite' },
      { icon: ({ ...props }) => <Icon icon="webpack" {...props} />, label: 'Webpack' },
      { icon: ({ ...props }) => <Icon icon="docker" {...props} />, label: 'Docker' },
      { icon: ({ ...props }) => <Icon icon="design-components" {...props} />, label: 'Design systems' },
      { icon: ({ ...props }) => <Icon icon="agile" {...props} />, label: 'Agile workflows' },
    ],
  },
  {
    label: 'Cloud Deployment',
    items: [
      { icon: ({ ...props }) => <Icon icon="netlify" {...props} />, label: 'Netlify' },
      { icon: ({ ...props }) => <Icon icon="vercel" {...props} />, label: 'Vercel' },
      { icon: ({ ...props }) => <Icon icon="aws" {...props} />, label: 'AWS' },
    ],
  },
  {
    label: 'Agentic AI',
    items: [
      { icon: ({ ...props }) => <Icon icon="copilot" {...props} />, label: 'GitHub Copilot' },
      { icon: ({ ...props }) => <Icon icon="chatgpt" {...props} />, label: 'ChatGPT' },
      { icon: ({ ...props }) => <Icon icon="cursor" {...props} />, label: 'Cursor' },
    ],
  },
];

const experience = [
  {
    role: 'Senior Frontend Engineer',
    company: 'Granular Energy',
    period: 'Apr 2023 - Aug 2025',
    summary: 'I led end-to-end delivery across multiple features, from prototyping to release, including SSG work using Nuxt.js and Prismic. I also focused on improving developer experience through refactoring, testing strategies, codebase architecture, and mentorship.',
  },
  {
    role: 'Senior Frontend Developer',
    company: 'Cycloid',
    period: 'Aug 2019 - Apr 2023',
    summary: 'This was a key chapter in my growth: Cycloid gave me a lot, and I gave 110% while being there. I shipped complex features, pushed component-driven practices with Storybook, and actively contributed to hiring and team onboarding.',
  },
  {
    role: 'Full-Stack Developer',
    company: 'Saavu',
    period: 'Nov 2018 - Jul 2019',
    summary: 'Working in a small team taught me speed and ownership, as well as code quality and having to wear many hats. I built core modules across frontend and backend using different frameworks, TDD, clean code and architecture, and close collaboration with the CEO.',
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