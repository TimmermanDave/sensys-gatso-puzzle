import styles from './GameTestLinks.module.css';

const reports = [
  { href: '/reports/vitest/index.html', label: 'Unit tests' },
  { href: '/reports/playwright/html/index.html', label: 'Browser tests' },
  { href: '/reports/lighthouse/index.html', label: 'Lighthouse' },
];

export function GameTestLinks() {
  const availableReports = reports.filter(({ href }) =>
    import.meta.env.GAME_TEST_REPORT_PATHS.includes(href),
  );

  if (availableReports.length === 0) return null;

  return (
    <nav className={styles.reports} aria-label="Development reports">
      <span>Reports</span>
      {availableReports.map(({ href, label }) => (
        <a key={href} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      ))}
    </nav>
  );
}
