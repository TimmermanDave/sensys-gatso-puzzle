import type { ComponentProps } from 'react';
import styles from './Card.module.css';

export function Card({ className = '', ...props }: ComponentProps<'section'>) {
  return <section {...props} className={`${styles.card} ${className}`} />;
}
