import { Text } from '@/components/ui';

const SUFFIXES = [
  'no fluff, just code and context.',
  'real problems, real solutions.',
  'written while shipping.',
  'the good parts and the ugly ones.',
  'what works, what breaks, and why.',
  'the good, the bad, and the ugly.',
  'because the docs never tell the full story.',
  'opinions formed in production.',
  'trade-offs, patterns, and the occasional rant.',
  'from an engineer perspective.',
  'for engineers who like to know why.',
  'building better things, one bug at a time.',
  'less tutorial, more autopsy.',
  'the stuff they cut from the official docs.',
  'patterns, pitfalls, and painful lessons.',
  'for when Stack Overflow just isn\'t enough.',
  'thinking out loud, if you please.',
  'written by someone who\'s shipped it.',
  'debugging ideas, one post at a time.',
  'strong opinions, loosely held and well-tested.',
  'because clean code doesn\'t write itself.',
];

const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];

function BlogTagline({ topic = 'Frontend Engineering' }: { topic?: string }) {
  return (
    <Text>
      All things <em><strong>{topic}</strong></em> — {suffix}
    </Text>
  );
}

export default BlogTagline;
