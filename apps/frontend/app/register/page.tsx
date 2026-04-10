"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/features/auth/register-client";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    const result = await registerUser({ name, lastName, email, password });

    if (!result.ok) {
      setErrorMessage(result.error);
      setIsSubmitting(false);
      return;
    }

    router.replace("/tasks");
  };

  return (
    <main className={styles.pageWrap}>
      <section className={styles.authCard} aria-labelledby="register-title">
        <h1 id="register-title" className={styles.authTitle}>
          Create account
        </h1>
        <p className={styles.authSubtitle}>
          Register to start managing your tasks.
        </p>

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <div className={styles.twoCols}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                First name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={styles.input}
                autoComplete="given-name"
                required
                placeholder="John"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName" className={styles.label}>
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className={styles.input}
                autoComplete="family-name"
                required
                placeholder="Doe"
              />
            </div>
          </div>

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
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Create a password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={styles.input}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Repeat your password"
            />
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}

        <p className={styles.hint}>Already have an account? Sign in from the login page.</p>
      </section>
    </main>
  );
}
