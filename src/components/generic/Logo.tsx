import styles from './Logo.module.css';

export function Logo() {
  return (
    <h1 className={styles.logo} aria-label="Sensys Gatso Puzzle">
      <span className={styles.text} aria-hidden="true">
        <span>Sensys</span>
        <span>Gatso</span>
        <span className={styles.subtitle}>Puzzle</span>
      </span>
    </h1>
  );
}
