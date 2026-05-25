import { expect, test } from '@playwright/test';

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('main heading and intro CTA section', async ({ page }) => {
    const introSection = page.locator('section', {
      has: page.getByRole('heading', { level: 1, name: /hi, i'm daniele/i }),
    }).first();

    await expect(introSection.getByRole('heading', { level: 1, name: /hi, i'm daniele/i })).toBeVisible();
    await expect(introSection.getByText(/craft frontend solutions that help teams ship and products scale/i)).toBeVisible();
    await expect(introSection.getByText(/over the last/i)).toBeVisible();
    await expect(introSection.getByText(/react/i)).toBeVisible();
    await expect(introSection.getByText(/vue/i)).toBeVisible();
    await expect(introSection.getByText(/typescript/i)).toBeVisible();

    const resumeBtn = introSection.getByRole('link', { name: /download my resume/i });
    await expect(resumeBtn).toBeVisible();
    await expect(resumeBtn).toHaveAttribute('href', /Daniele-Gazzelloni-Resume-\d{4}\.pdf$/);
    await expect(resumeBtn).toHaveAttribute('download', '');

    const connectLinkedInBtn = introSection.getByRole('link', { name: /connect on linkedin/i });
    await expect(connectLinkedInBtn).toBeVisible();
    await expect(connectLinkedInBtn).toHaveAttribute('href', /linkedin\.com/i);
  });

  test('tools i trust section', async ({ page }) => {
    const toolsSection = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: /tools i trust/i }),
    }).first();

    await expect(toolsSection.getByRole('heading', { level: 2, name: /tools i trust/i })).toBeVisible();
    await expect(toolsSection.getByRole('heading', { level: 4, name: /frameworks & languages/i })).toBeVisible();
    await expect(toolsSection.getByRole('heading', { level: 4, name: /testing, monitoring & quality assurance/i })).toBeVisible();
    await expect(toolsSection.getByRole('heading', { level: 4, name: /cloud deployment/i })).toBeVisible();
    await expect(toolsSection.getByRole('heading', { level: 4, name: /agentic ai/i })).toBeVisible();

    await expect(toolsSection.getByText('Next.js')).toBeVisible();
    await expect(toolsSection.getByText('Cypress')).toBeVisible();
    await expect(toolsSection.getByText('Vercel')).toBeVisible();
    await expect(toolsSection.getByText('GitHub Copilot')).toBeVisible();

    await expect(toolsSection.getByRole('heading', { level: 4 })).toHaveCount(8);
  });

  test('my journey so far section', async ({ page }) => {
    const journeySection = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: /my journey so far/i }),
    }).first();

    await expect(journeySection.getByRole('heading', { level: 2, name: /my journey so far/i })).toBeVisible();

    const resumeBtn = journeySection.getByRole('link', { name: /download my resume/i });
    await expect(resumeBtn).toBeVisible();
    await expect(resumeBtn).toHaveAttribute('href', /Daniele-Gazzelloni-Resume-2026\.pdf$/);

    await expect(journeySection.getByRole('heading', { level: 3, name: /senior frontend engineer/i })).toBeVisible();
    await expect(journeySection.getByRole('heading', { level: 3, name: /senior frontend developer/i })).toBeVisible();
    await expect(journeySection.getByRole('heading', { level: 3, name: /freelance javascript developer/i })).toBeVisible();

    await expect(journeySection.getByText(/apr 2023 - aug 2025/i)).toBeVisible();
    await expect(journeySection.getByRole('heading', { level: 3, name: /cycloid/i })).toBeVisible();
    await expect(journeySection.getByRole('heading', { level: 3, name: /upwork/i })).toBeVisible();

    await expect(journeySection.getByRole('heading', { level: 3 })).toHaveCount(6);
  });

  test('beyond the stack section', async ({ page }) => {
    const beyondSection = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: /beyond the stack/i }),
    }).first();

    await expect(beyondSection.getByRole('heading', { level: 2, name: /beyond the stack/i })).toBeVisible();
    await expect(beyondSection.getByText(/university of rome/i)).toBeVisible();
    await expect(beyondSection.getByText(/pascal/i)).toBeVisible();
    await expect(beyondSection.getByText(/basic/i)).toBeVisible();
    await expect(beyondSection.getByText(/linux and open source/i)).toBeVisible();
    await expect(beyondSection.getByText(/i'm fluent in/i)).toBeVisible();
    await expect(beyondSection.locator('strong').filter({ hasText: /^English$/ })).toBeVisible();
    await expect(beyondSection.locator('strong').filter({ hasText: /^Spanish$/ })).toBeVisible();
    await expect(beyondSection.locator('strong').filter({ hasText: /^Italian$/ })).toBeVisible();
  });

  test('let\'s talk frontend section', async ({ page }) => {
    const letsTalkSection = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: /let's talk frontend/i }),
    }).first();

    await expect(letsTalkSection.getByRole('heading', { level: 2, name: /let's talk frontend/i })).toBeVisible();
    await expect(letsTalkSection.getByText(/working on a frontend project/i)).toBeVisible();
    await expect(letsTalkSection.getByText(/good conversation about programming languages/i)).toBeVisible();

    const emailBtn = letsTalkSection.getByRole('link', { name: /email me/i });
    await expect(emailBtn).toBeVisible();
    await expect(emailBtn).toHaveAttribute('href', /mailto:/i);

    const linkedInBtn = letsTalkSection.getByRole('link', { name: /connect on linkedin/i });
    await expect(linkedInBtn).toBeVisible();
    await expect(linkedInBtn).toHaveAttribute('href', /linkedin\.com/i);

    const githubBtn = letsTalkSection.getByRole('link', { name: /view github/i });
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toHaveAttribute('href', /github\.com/i);
  });
});