import type { Metadata } from 'next';
import {
  BeyondTheStack,
  ToolsITrust,
  IntroTextAndCTAs,
  MyJourneySoFar,  
} from '@/components/about';

export const metadata: Metadata = {
  title: 'About',
};

export default async function AboutPage() {
  return (
    <article className="mx-auto sm:py-4 md:py-12">
      <IntroTextAndCTAs />

      <ToolsITrust />

      <MyJourneySoFar />

      <BeyondTheStack />
    </article>
  );
}
