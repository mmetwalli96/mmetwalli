import { Page } from '@/components/layout/Page';
import { ContactForm } from '@/components/contact/ContactForm';
import { LocalTime } from '@/components/ui/LocalTime';
import { ScatterTitle } from '@/components/ui/ScatterTitle';
import { profile } from '@/data/profile';
import styles from '@/pages/Contact.module.css';

export default function Contact() {
  return (
    <Page title="Contact">
      <div className={`container ${styles.layout}`}>
        <section className={styles.aside} aria-labelledby="contact-title">
          <ScatterTitle id="contact-title" text="Get in touch" className={`display ${styles.title}`} />
          <p className={styles.lead}>Fill in the form to send me a message.</p>

          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Local time</dt>
              <dd>
                <LocalTime withCity={false} />
              </dd>
            </div>
            <div className={styles.fact}>
              <dt>Currently</dt>
              <dd>
                {profile.role} at {profile.company}
              </dd>
            </div>
          </dl>
        </section>

        <ContactForm />
      </div>
    </Page>
  );
}
