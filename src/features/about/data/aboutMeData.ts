export type ToolIconKey =
  | 'html5'
  | 'css3'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'vue'
  | 'nextjs'
  | 'nuxtjs'
  | 'redux'
  | 'zustand'
  | 'jotai'
  | 'pinia'
  | 'jest'
  | 'vitest'
  | 'testing-library'
  | 'cypress'
  | 'playwright'
  | 'sentry'
  | 'datadog'
  | 'figma'
  | 'tailwindcss'
  | 'sass'
  | 'materialui'
  | 'remix'
  | 'vuetify'
  | 'storybook'
  | 'graphql'
  | 'react-query'
  | 'highcharts'
  | 'aggrid'
  | 'rest'
  | 'swagger'
  | 'vscode'
  | 'nodejs'
  | 'vite'
  | 'webpack'
  | 'docker'
  | 'github'
  | 'design-components'
  | 'agile'
  | 'netlify'
  | 'vercel'
  | 'aws'
  | 'claude-code'
  | 'copilot'
  | 'cursor';

const skills: ReadonlyArray<{
  label: string;
  items: ReadonlyArray<{ icon: ToolIconKey; label: string }>;
}> = [
  {
    label: 'Frameworks & Languages',
    items: [
      { icon: 'html5', label: 'HTML5' },
      { icon: 'css3', label: 'CSS3' },
      { icon: 'javascript', label: 'JavaScript' },
      { icon: 'typescript', label: 'TypeScript' },
      { icon: 'react', label: 'React' },
      { icon: 'vue', label: 'Vue' },
      { icon: 'nextjs', label: 'Next.js' },
      { icon: 'nuxtjs', label: 'Nuxt.js' },
    ],
  },
  {
    label: 'State Management',
    items: [
      { icon: 'redux', label: 'Redux' },
      { icon: 'zustand', label: 'Zustand' },
      { icon: 'jotai', label: 'Jotai' },
      { icon: 'pinia', label: 'Pinia' },
      { icon: 'vue', label: 'Vuex' },
    ],
  },
  {
    label: 'Testing, Monitoring & Quality Assurance',
    items: [
      { icon: 'jest', label: 'Jest' },
      { icon: 'vitest', label: 'Vitest' },
      { icon: 'testing-library', label: 'Testing Library' },
      { icon: 'cypress', label: 'Cypress' },
      { icon: 'playwright', label: 'Playwright' },
      { icon: 'sentry', label: 'Sentry' },
      { icon: 'datadog', label: 'DataDog' },
    ],
  },
  {
    label: 'Design',
    items: [
      { icon: 'figma', label: 'Figma' },
      { icon: 'tailwindcss', label: 'Tailwind CSS' },
      { icon: 'sass', label: 'SCSS, Sass' },
      { icon: 'materialui', label: 'Material UI' },
      { icon: 'remix', label: 'Remix' },
      { icon: 'vuetify', label: 'Vuetify' },
      { icon: 'storybook', label: 'Storybook' },
    ],
  },
  {
    label: 'Data Visualization',
    items: [
      { icon: 'graphql', label: 'GraphQL' },
      { icon: 'react-query', label: 'React Query' },
      { icon: 'highcharts', label: 'Highcharts' },
      { icon: 'aggrid', label: 'AG Grid' },
    ],
  },
  {
    label: 'Tooling & Automation',
    items: [
      { icon: 'rest', label: 'REST API' },
      { icon: 'swagger', label: 'Swagger, OpenAPI' },
      { icon: 'vscode', label: 'VS Code' },
      { icon: 'nodejs', label: 'Node.js' },
      { icon: 'vite', label: 'Vite' },
      { icon: 'webpack', label: 'Webpack' },
      { icon: 'docker', label: 'Docker' },
      { icon: 'github', label: 'GitHub Actions' },
      { icon: 'design-components', label: 'Design systems' },
      { icon: 'agile', label: 'Agile workflows' },
    ],
  },
  {
    label: 'Cloud Deployment',
    items: [
      { icon: 'netlify', label: 'Netlify' },
      { icon: 'vercel', label: 'Vercel' },
      { icon: 'aws', label: 'AWS' },
    ],
  },
  {
    label: 'AI-Assisted Development',
    items: [
      { icon: 'claude-code', label: 'Claude Code' },
      { icon: 'copilot', label: 'GitHub Copilot' },
      { icon: 'cursor', label: 'Cursor' },
    ],
  },
];

const experience = [
  {
    role: 'Senior AI Frontend Engineer',
    company: 'Cycloid',
    period: 'Jul 2026 - present',
    summary: 'I returned to Cycloid to support a strategic transition between their legacy platform and its next-generation rebuild, bringing back historical product context from my earlier years there. I balanced critical work for enterprise customers on the existing platform with contributing to the new AI-assisted, specification-driven platform, working with Vue 3, Nuxt, TypeScript, Claude Code and Cursor.',
  },
  {
    role: 'Independent Software Engineer',
    company: 'dangz.dev',
    period: 'Oct 2025 - Jun 2026',
    summary: 'Between contracts, I built complex React and Next.js applications to deepen my expertise in the modern React ecosystem, including the App Router, headless CMS integrations and modern state/data patterns. I also started this blog to write about frontend architecture and scalable UI engineering, and sharpened my AI-assisted development workflow with Claude Code and Cursor.',
  },
  {
    role: 'Senior Frontend Engineer',
    company: 'Granular Energy',
    period: 'Apr 2023 - Aug 2025',
    summary: 'I led the frontend work of multiple features end-to-end, from prototyping to release, including internal tooling and SSG work using Nuxt.js and Prismic. I also focused on improving developer experience through refactoring, testing strategies, codebase architecture, and mentorship.',
  },
  {
    role: 'Senior Frontend Developer',
    company: 'Cycloid',
    period: 'Aug 2019 - Apr 2023',
    summary: 'This was a key chapter in my growth, as it\'s where I effectively started thinking and moving like a senior engineer. I shipped complex features, developing component-driven designs with Storybook and helping with codebase architecture. I also actively contributed to hiring, product management and onboarding.',
  },
  {
    role: 'Full-Stack Developer',
    company: 'Saavu',
    period: 'Nov 2018 - Jul 2019',
    summary: 'Working in a small team where code quality mattered taught me speed, versatility and ownership. I built core modules across frontend and backend using different frameworks, TDD, clean code and architecture, and close collaboration with the CEO.',
  },
  {
    role: 'Full-Stack Developer',
    company: '33 Mile Radius',
    period: 'Dec 2015 - Oct 2018',
    summary: 'I owned the full lifecycle of web and mobile products, from shipping new features to maintaining production systems and supporting marketing websites. I helped them build their main product - a hybrid mobile/desktop reviews generation app.',
  },
  {
    role: 'Earlier Roles',
    company: '(condensed)',
    period: '2013 - 2015',
    summary: 'Freelancing sharpened my adaptability. I worked with different industries and stacks, delivering React frontends, full-stack features on Node.js, and custom WordPress work. I also developed a Microsoft PC game using TypeScript, C# and Unity 3D.',
  },
];

const aboutMeData = {
  skills,
  experience,
};

export default aboutMeData;
