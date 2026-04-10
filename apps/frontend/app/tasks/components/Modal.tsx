import React, { useEffect, useRef, useState } from "react";
import AppButton from "./AppButton";
import styles from "./Modal.module.css";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  onSave?: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  saveLabel?: string;
  dismissLabel?: string;
  showDefaultFooter?: boolean;
}

function Modal({
  visible,
  onClose,
  onDismiss,
  onSave,
  title,
  children,
  footer,
  isLoading = false,
  saveLabel = "Save",
  dismissLabel = "Dismiss",
  showDefaultFooter = true,
}: ModalProps) {
  const [show, setShow] = useState(visible);
  const [animate, setAnimate] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setShow(true);
      // Wait for next tick to trigger animation
      setTimeout(() => setAnimate(true), 10);
    } else if (show) {
      setAnimate(false);
      timeoutRef.current = setTimeout(() => setShow(false), 280);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!show) return null;

  const handleDismiss = onDismiss || onClose;

  return (
    <div className={styles.modal}>
      <div
        className={
          animate
            ? `${styles["modal-content"]} ${styles["modal-content--visible"]}`
            : styles["modal-content"]
        }
      >
        {title && <h2>{title}</h2>}
        <div>{children}</div>
        {footer !== undefined ? (
          <div className={styles["modal-cta"]}>{footer}</div>
        ) : showDefaultFooter ? (
          <div className={styles["modal-cta"]}>
            <AppButton onClick={handleDismiss} variant="ghost" disabled={isLoading}>
              {dismissLabel}
            </AppButton>
            <AppButton onClick={onSave} isLoading={isLoading}>
              {saveLabel}
            </AppButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Modal;
