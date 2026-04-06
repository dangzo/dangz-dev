import {
  BeyondTheStack,
  ToolsITrust,
  IntroTextAndCTAs,
  MyJourneySoFar,  
} from '@/components/about';

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
