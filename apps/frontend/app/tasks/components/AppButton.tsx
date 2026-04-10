import React from "react";
import styles from "./AppButton.module.css";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function AppButton({
  className,
  children,
  variant = "primary",
  isLoading = false,
  leftIcon,
  rightIcon,
  type = "button",
  disabled = false,
  ...rest
}: AppButtonProps) {
  const variantClass = variant === "ghost" ? styles.ghost : styles.primary;
  const classes = [styles.button, variantClass, className, isLoading ? styles.loading : ""]
    .filter(Boolean)
    .join(" ");

  const isDisabled = disabled || isLoading;

  return (
    <button type={type} className={classes} disabled={isDisabled} {...rest}>
      <span className={styles.content}>
        {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : leftIcon}
        <span>{children}</span>
        {!isLoading ? rightIcon : null}
      </span>
    </button>
  );
}

export default AppButton;
