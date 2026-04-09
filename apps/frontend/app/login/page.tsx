"use client";

import { useState } from "react";
import { loginUser } from "@/lib/features/auth/login-client";
import styles from "./page.module.css";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await loginUser(email, password);

    if (!result.ok) {
      setErrorMessage(result.error);
      setIsSubmitting(false);
      return;
    }

    alert(`Welcome ${result.data.user.name || "back"}`);
    setIsSubmitting(false);
  };

  return (
    <main className={styles.pageWrap}>
      <section className={styles.authCard} aria-labelledby="login-title">
        <h1 id="login-title" className={styles.authTitle}>
          Welcome back
        </h1>
        <p className={styles.authSubtitle}>
          Sign in to manage your tasks and team workflow.
        </p>

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}

        <p className={styles.hint}>Google login and API wiring are next.</p>
      </section>
    </main>
  );
}
