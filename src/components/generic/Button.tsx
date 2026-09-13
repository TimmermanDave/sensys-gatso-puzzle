import type { ComponentProps } from 'react';

import styles from './Button.module.css';

type Props = ComponentProps<'button'> & { variant?: 'primary' | 'secondary' };

export function Button({
  variant = 'secondary',
  className = '',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      {...props}
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
    />
  );
}
