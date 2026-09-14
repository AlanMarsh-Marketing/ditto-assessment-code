"use client";

import * as React from "react";

export interface FormFieldProps {
  label: string;
  type: "text" | "email" | "select";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  options?: string[];
  /** Error message to show below the field — also switches the border red. */
  error?: string;
  placeholder?: string;
  name?: string;
}

const fieldBaseStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--fs-body)",
  color: "var(--text-body)",
  background: "var(--surface-card)",
  border: "1.5px solid var(--border-subtle)",
  borderRadius: "var(--radius-xs)",
  padding: "12px 14px",
  outline: "none",
};

/**
 * Ditto form field — text / email / select, per brand/readme.md's "Form
 * fields" UI pattern: 1.5px hairline border, 6px radius, purple-medium
 * label, red border + message on error. The orange focus ring comes for
 * free from the global `:focus-visible` rule in brand/ditto-tokens.css —
 * this component doesn't need to reimplement it.
 */
export function FormField({
  label,
  type,
  value,
  onChange,
  required = false,
  options,
  error,
  placeholder,
  name,
}: FormFieldProps) {
  const fieldId = React.useId();
  const style: React.CSSProperties = {
    ...fieldBaseStyle,
    ...(error ? { borderColor: "var(--danger)" } : null),
  };

  return (
    <div>
      <label
        htmlFor={fieldId}
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: "var(--fs-sm)",
          fontWeight: "var(--fw-medium)",
          color: "var(--ditto-purple)",
        }}
      >
        {label}
        {required ? <span style={{ color: "var(--ditto-orange)" }}> *</span> : null}
      </label>

      {type === "select" ? (
        <select
          id={fieldId}
          name={name}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          style={style}
        >
          <option value="" disabled>
            {placeholder ?? "Select…"}
          </option>
          {(options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={style}
        />
      )}

      {error ? (
        <p style={{ marginTop: 6, fontSize: "var(--fs-caption)", color: "var(--danger)" }}>{error}</p>
      ) : null}
    </div>
  );
}
