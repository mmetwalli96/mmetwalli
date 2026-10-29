import { Page } from '@/components/layout/Page';
import { Hero } from '@/components/hero/Hero';
import { Experience } from '@/components/home/Experience';
import { Skills } from '@/components/home/Skills';
import { ContactCta } from '@/components/home/ContactCta';

export default function Home() {
  return (
    <Page>
      <Hero />
      <Experience />
      <Skills />
      <ContactCta />
    </Page>
  );
}
