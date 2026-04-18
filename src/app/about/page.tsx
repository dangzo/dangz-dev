import type { Metadata } from 'next';
import {
  BeyondTheStack,
  ToolsITrust,
  IntroTextAndCTAs,
  MyJourneySoFar,  
} from '@/features/about/components';
import BeyondTheStackContact from '@/features/about/components/BeyondTheStackContact';

export const metadata: Metadata = {
  title: 'About',
};

export default async function AboutPage() {
  return (
    <article className="sm:py-4 md:py-12">
      <div className="mx-auto max-w-5xl flex flex-col">
        <IntroTextAndCTAs />

        <ToolsITrust />

        <MyJourneySoFar />

        <BeyondTheStack />

        <BeyondTheStackContact />
      </div>
    </article>
  );
}
