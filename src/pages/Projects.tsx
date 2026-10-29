import { Page } from '@/components/layout/Page';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ScatterTitle } from '@/components/ui/ScatterTitle';
import { projects } from '@/data/projects';
import styles from '@/pages/Projects.module.css';

export default function Projects() {
  return (
    <Page title="Projects">
      <div className={`container ${styles.page}`}>
        <ScatterTitle text="Projects" className={`display ${styles.title}`} />
        <ul className={styles.list} aria-label="Projects">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
