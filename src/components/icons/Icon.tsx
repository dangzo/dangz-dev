import { clsx } from 'clsx';
import { Link } from '@/components/ui';

// Social icons
import GithubIcon from './socials/GithubIcon';
import LinkedinIcon from './socials/LinkedinIcon';
import MailIcon from './socials/MailIcon';
// Devicons
import AgGridIcon from './devicons/AgGridIcon';
import DevOpsIcon from './devicons/DevOpsIcon';
import HighchartsIcon from './devicons/HighchartsIcon';
import Html5Icon from './devicons/Html5Icon';
import Css3Icon from './devicons/Css3Icon';
import JavaScriptIcon from './devicons/JavaScriptIcon';
import TypeScriptIcon from './devicons/TypeScriptIcon';
import ReactIcon from './devicons/ReactIcon';
import VueIcon from './devicons/VueIcon';
import MaterialUIIcon from './devicons/MaterialUIIcon';
import NextjsIcon from './devicons/NextjsIcon';
import NuxtjsIcon from './devicons/NuxtjsIcon';
import VSCodeIcon from './devicons/VSCodeIcon';
import ReduxIcon from './devicons/ReduxIcon';
import StorybookIcon from './devicons/StorybookIcon';
import WebpackIcon from './devicons/WebpackIcon';
import DockerIcon from './devicons/DockerIcon';
import GraphQLIcon from './devicons/GraphQLIcon';
// import RestIcon from './devicons/RestIcon';
import ReactQueryIcon from './devicons/ReactQueryIcon';
import JestIcon from './devicons/JestIcon';
import VitestIcon from './devicons/VitestIcon';
import CypressIcon from './devicons/CypressIcon';
import TailwindCSSIcon from './devicons/TailwindCSSIcon';
import SassIcon from './devicons/SassIcon';
import FigmaIcon from './devicons/FigmaIcon';
import RemixIcon from './devicons/RemixIcon';
import VuetifyIcon from './devicons/VuetifyIcon';
import ZustandIcon from './devicons/ZustandIcon';
import SentryIcon from './devicons/SentryIcon';
import DataDogIcon from './devicons/DataDogIcon';
import RESTApiIcon from './devicons/RESTApiIcon';
import ViteIcon from './devicons/ViteIcon';
import PiniaIcon from './devicons/PiniaIcon';
import JotaiIcon from './devicons/JotaiIcon';
import NetlifyIcon from './devicons/NetlifyIcon';
import VercelIcon from './devicons/VercelIcon';
import NodeJSIcon from './devicons/NodeJSIcon';
import AWSIcon from './devicons/AWSIcon';
import DesignComponentsIcon from './devicons/DesignComponentsIcon';
import ScrumIcon from './devicons/ScrumIcon';
import SwaggerIcon from './devicons/SwaggerIcon';
import TestingLibraryIcon from './devicons/TestingLibraryIcon';
import CopilotIcon from './devicons/CopilotIcon';
import ChatGPTIcon from './devicons/ChatGPTIcon';
import CursorIcon from './devicons/CursorIcon';

const components = {
  // Social icons
  mail: MailIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,

  // Devicons
  devops: DevOpsIcon,
  redux: ReduxIcon,
  materialui: MaterialUIIcon,
  storybook: StorybookIcon,
  webpack: WebpackIcon,
  docker: DockerIcon,
  graphql: GraphQLIcon,
  highcharts: HighchartsIcon,
  // rest: RestIcon,
  aggrid: AgGridIcon,
  css3: Css3Icon,
  javascript: JavaScriptIcon,
  typescript: TypeScriptIcon,
  react: ReactIcon,
  vue: VueIcon,
  nextjs: NextjsIcon,
  nuxtjs: NuxtjsIcon,
  vscode: VSCodeIcon,
  jest: JestIcon,
  vitest: VitestIcon,
  cypress: CypressIcon,
  tailwindcss: TailwindCSSIcon,
  sass: SassIcon,
  figma: FigmaIcon,
  html5: Html5Icon,
  remix: RemixIcon,
  vuetify: VuetifyIcon,
  zustand: ZustandIcon,
  sentry: SentryIcon,
  datadog: DataDogIcon,
  vercel: VercelIcon,
  nodejs: NodeJSIcon,
  aws: AWSIcon,
  netlify: NetlifyIcon,
  rest: RESTApiIcon,
  vite: ViteIcon,
  jotai: JotaiIcon,
  pinia: PiniaIcon,
  agile: ScrumIcon,
  swagger: SwaggerIcon,
  copilot: CopilotIcon,
  chatgpt: ChatGPTIcon,
  cursor: CursorIcon,
  'react-query': ReactQueryIcon,
  'design-components': DesignComponentsIcon,
  'testing-library': TestingLibraryIcon,
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  icon: keyof typeof components;
  href?: string;
  size?: number;
  'data-umami-event'?: string;
};

const IconWrapper = ({ icon, size, ...rest }: React.SVGProps<SVGSVGElement> & {
  size?: number; icon: keyof typeof components
}) => {
  const SVGIcon = components[icon];

  return (
    <SVGIcon
      width={size}
      height={size}
      {...rest}
    />
  );
};

const Icon = ({ icon, href, size = 8, className, 'data-umami-event': umamiEvent, ...rest }: IconProps) => {
  if (!href) return <IconWrapper icon={icon} size={size} {...rest} />;

  return (
    <Link
      className="text-sm"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      data-umami-event={umamiEvent}
    >
      <span className="sr-only">{icon}</span>
      <IconWrapper
        icon={icon}
        className={clsx(`
          h-${size} w-${size}
          fill-current transition-colors duration-300
          hover:text-primary-500 dark:hover:text-primary-400 text-gray-700 dark:text-main-dark
        `, className)}
        {...rest}
      />
    </Link>
  );
};

export default Icon;
