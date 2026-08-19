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

const deferredSectionStyle = (heightPx: number) => ({
  contentVisibility: 'auto',
  containIntrinsicSize: `1px ${heightPx}px`,
}) as const;

export default function AboutPage() {
  return (
    <article className="sm:py-4 md:py-12">
      <div className="mx-auto flex flex-col">
        <IntroTextAndCTAs />

        <section style={deferredSectionStyle(1900)}>
          <ToolsITrust />
        </section>

        <section style={deferredSectionStyle(1400)}>
          <MyJourneySoFar />
        </section>

        <section style={deferredSectionStyle(420)}>
          <BeyondTheStack />
        </section>

        <section style={deferredSectionStyle(400)}>
          <LetsTalkFrontend />
        </section>
      </div>
    </article>
  );
}
