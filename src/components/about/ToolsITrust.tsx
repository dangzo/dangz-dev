import { kebabCase } from 'lodash-es';
import { Heading, Text } from '@/components/ui';
import aboutMeData from '@/data/aboutMeData';

const { skills } = aboutMeData;

function ToolsITrust() {
  return (
    <section className="mb-8 sm:mb-16 md:mb-20">
      <Heading as="h2">
        Tools I trust
      </Heading>

      <ul className="grid gap-2 sm:gap-4 md:gap-5 md:grid-cols-2">
        {skills.map(({ items, label }) => (
          <li
            key={kebabCase(label)}
            className="rounded-2xl border border-border-light/60 dark:border-border-dark/60 bg-background-secondary-light/70 dark:bg-background-secondary-dark/40 p-3 md:p-5"
          >
            <Heading as="h4" className="mb-4">{label}</Heading>

            <ul className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-3">
              {items.map((tool) => (
                <li
                  key={kebabCase(`${label}-${tool.label}`)}
                  className="flex items-center gap-2 md:gap-3 rounded-xl px-2 py-2 md:px-3 md:py-3"
                >
                  <span
                    aria-hidden="true"
                    className="
                      h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12
                      flex shrink-0 items-center justify-center rounded-lg
                      bg-white text-primary-700 dark:bg-neutral-100 dark:text-primary-200
                    "
                  >
                    {tool.icon({ height: 38, width: 38 })}
                  </span>

                  <Text size="small" className="mb-0! font-medium text-main-light dark:text-main-dark">
                    {tool.label}
                  </Text>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ToolsITrust;