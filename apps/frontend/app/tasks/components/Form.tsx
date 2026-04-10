import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "textarea"
  | "select"
  | "password";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[]; // for select
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number;
}

export interface FormProps {
  fields: FieldConfig[];
  initialValues?: Record<string, string | number>;
  onSubmit: (values: Record<string, string | number>) => void;
  /** Called after validation when submit is triggered (including via ref.submit). */
  onValidateResult?: (isValid: boolean) => void;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
  inputClassName?: string;
  fieldClassName?: string;
  labelClassName?: string;
}

export type FormHandle = {
  submit: () => void;
};

const Form = forwardRef<FormHandle, FormProps>(
  (
    {
      fields,
      initialValues = {},
      onSubmit,
      onValidateResult,
      submitLabel = "Submit",
      isLoading = false,
      className = "",
      inputClassName = "",
      fieldClassName = "",
      labelClassName = "",
    },
    ref
  ) => {
  const innerFormRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<string, string | number>>(() => {
    const v: Record<string, string | number> = {};
    fields.forEach((f) => {
      v[f.name] = initialValues[f.name] ?? f.defaultValue ?? "";
    });
    return v;
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function isEmptyRequiredValue(f: FieldConfig, raw: string | number): boolean {
    if (raw === "" || raw === undefined || raw === null) {
      return true;
    }
    if (
      typeof raw === "string" &&
      (f.type === "text" ||
        f.type === "textarea" ||
        f.type === "email" ||
        f.type === "password")
    ) {
      return raw.trim() === "";
    }
    return false;
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && isEmptyRequiredValue(f, values[f.name])) {
        nextErrors[f.name] = `${f.label} is required`;
      }
      if (f.type === "email" && values[f.name]) {
        const emailRegex = /.+@.+\..+/;
        const emailStr = String(values[f.name]);
        if (!emailRegex.test(emailStr)) {
          nextErrors[f.name] = "Invalid email address";
        }
      }
      if (f.type === "number" && values[f.name] !== "") {
        const val = Number(values[f.name]);
        if (isNaN(val)) {
          nextErrors[f.name] = `${f.label} must be a number`;
        }
        if (f.min !== undefined && val < f.min) {
          nextErrors[f.name] = `${f.label} must be at least ${f.min}`;
        }
        if (f.max !== undefined && val > f.max) {
          nextErrors[f.name] = `${f.label} must be at most ${f.max}`;
        }
      }
    });
    setErrors(nextErrors);
    return nextErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    const isValid = Object.keys(errs).length === 0;
    onValidateResult?.(isValid);
    if (isValid) {
      onSubmit(values);
    }
  }

  useImperativeHandle(ref, () => ({
    submit: () => {
      innerFormRef.current?.requestSubmit();
    },
  }));

  return (
    <form
      ref={innerFormRef}
      onSubmit={handleSubmit}
      className={className}
      autoComplete="off"
    >
      {fields.map((f) => (
        <div key={f.name} className={fieldClassName} style={{ marginBottom: 18 }}>
          <label htmlFor={f.name} className={labelClassName} style={{ fontWeight: 500 }}>
            {f.label}
            {f.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={f.name}
              name={f.name}
              value={values[f.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={f.placeholder}
              required={f.required}
              className={inputClassName}
              style={{ width: "100%", minHeight: 64, marginTop: 6 }}
              disabled={isLoading}
            />
          ) : f.type === "select" && f.options ? (
            <select
              id={f.name}
              name={f.name}
              value={values[f.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              required={f.required}
              className={inputClassName}
              style={{ width: "100%", marginTop: 6 }}
              disabled={isLoading}
            >
              <option value="">Select…</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              value={values[f.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={f.placeholder}
              required={f.required}
              min={f.min}
              max={f.max}
              step={f.step}
              className={inputClassName}
              style={{ width: "100%", marginTop: 6 }}
              disabled={isLoading}
            />
          )}
          {errors[f.name] && touched[f.name] && (
            <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 4 }}>{errors[f.name]}</div>
          )}
        </div>
      ))}
      <button type="submit" style={{ display: "none" }} disabled={isLoading} />
    </form>
  );
});

Form.displayName = "Form";

export default Form;
