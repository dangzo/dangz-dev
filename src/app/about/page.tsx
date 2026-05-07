import type { Metadata } from 'next';
import {
  BeyondTheStack,
  ToolsITrust,
  IntroTextAndCTAs,
  MyJourneySoFar,  
} from '@/features/about/components';
import BeyondTheStackContact from '@/features/about/components/LetsTalkFrontend';

export const metadata: Metadata = {
  title: 'About',
  alternates: {
    canonical: '/about',
  },
};

export default async function AboutPage() {
  return (
    <article className="sm:py-4 md:py-12">
      <div className="mx-auto flex flex-col">
        <IntroTextAndCTAs />

        <ToolsITrust />

        <MyJourneySoFar />

        <BeyondTheStack />

        <BeyondTheStackContact />
      </div>
    </article>
  );
}
