import type { Metadata } from 'next';
import {
  BeyondTheStack,
  LetsTalkFrontend,
  ToolsITrust,
  IntroTextAndCTAs,
  MyJourneySoFar,  
} from '@/features/about/components';

export const metadata: Metadata = {
  title: 'About',
  alternates: {
    canonical: '/about',
  },
};

const deferredSectionStyle = {
  contentVisibility: 'auto',
  containIntrinsicSize: '1px 900px',
} as const;

export default function AboutPage() {
  return (
    <article className="sm:py-4 md:py-12">
      <div className="mx-auto flex flex-col">
        <IntroTextAndCTAs />

        <section style={deferredSectionStyle}>
          <ToolsITrust />
        </section>

        <section style={deferredSectionStyle}>
          <MyJourneySoFar />
        </section>

        <section style={deferredSectionStyle}>
          <BeyondTheStack />
        </section>

        <section style={deferredSectionStyle}>
          <LetsTalkFrontend />
        </section>
      </div>
    </article>
  );
}
