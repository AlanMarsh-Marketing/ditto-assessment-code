"use client";

import * as React from "react";
import type { Quiz } from "@/lib/quiz-schema";
import { Button, Card, Badge, Logo, FormField } from "@/components/ds";

export function IntroScreen({
  quiz,
  isPreview,
  embed = false,
  onStart,
}: {
  quiz: Quiz;
  isPreview: boolean;
  embed?: boolean;
  onStart: (identity: Record<string, string>) => void;
}) {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function handleStart() {
    const nextErrors: Record<string, string> = {};
    for (const field of quiz.identityFields) {
      if (field.required && !(values[field.key] ?? "").trim()) {
        nextErrors[field.key] = `${field.label} is required.`;
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onStart(values);
  }

  return (
    <div
      style={
        embed
          ? { display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px" }
          : { minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px" }
      }
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Logo variant="color" height={28} />
          {isPreview ? <Badge tone="purple" soft>Preview — not saved</Badge> : null}
        </div>

        <p className="ditto-eyebrow">{quiz.audience}</p>
        <h1 style={{ marginTop: 8, fontSize: "var(--fs-h2)", fontWeight: "var(--fw-regular)", color: "var(--text-strong)" }}>
          {quiz.title}
        </h1>
        {quiz.description ? (
          <p style={{ marginTop: 12, fontSize: "var(--fs-lead)", color: "var(--text-body)" }}>{quiz.description}</p>
        ) : null}

        {quiz.identityFields.length > 0 ? (
          <Card style={{ marginTop: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {quiz.identityFields.map((field) => (
                <FormField
                  key={field.key}
                  label={field.label}
                  type={field.type}
                  required={field.required}
                  options={field.options}
                  value={values[field.key] ?? ""}
                  error={errors[field.key]}
                  onChange={(value) => {
                    setValues((v) => ({ ...v, [field.key]: value }));
                    setErrors((e) => ({ ...e, [field.key]: "" }));
                  }}
                />
              ))}
            </div>
          </Card>
        ) : null}

        <div style={{ marginTop: 28 }}>
          <Button variant="primary" size="lg" onClick={handleStart} style={{ width: "100%" }}>
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
