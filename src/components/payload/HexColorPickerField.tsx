"use client";

import { useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";

const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

const normalizeHex = (value: string | undefined): string => {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed.startsWith("#")) return "";

  if (HEX_COLOR_PATTERN.test(trimmed)) {
    if (trimmed.length === 4) {
      const [_, r, g, b] = trimmed;
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return trimmed.toLowerCase();
  }

  return "";
};

export const HexColorPickerField: TextFieldClientComponent = (props) => {
  const { path, field, readOnly } = props;
  const { value, setValue, errorMessage, showError } = useField<string>({ path });

  const currentValue = typeof value === "string" ? value : "";
  const pickerValue = normalizeHex(currentValue);

  return (
    <div className="field-type text">
      <label className="field-label" htmlFor={`${path}-hex-input`}>
        {typeof field.label === "string" ? field.label : field.name}
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <input
          id={`${path}-hex-picker`}
          aria-label="Pick color"
          disabled={readOnly}
          onChange={(event) => setValue(event.target.value.toLowerCase())}
          style={{
            appearance: "none",
            background: "none",
            border: "1px solid hsl(var(--theme-elevation-150))",
            borderRadius: "0.5rem",
            cursor: readOnly ? "not-allowed" : "pointer",
            height: "2.75rem",
            padding: 0,
            width: "3.5rem",
          }}
          type="color"
          value={pickerValue}
        />

        <input
          id={`${path}-hex-input`}
          className="input"
          disabled={readOnly}
          onChange={(event) => setValue(event.target.value)}
          placeholder="#0A1B3F"
          spellCheck={false}
          type="text"
          value={currentValue}
        />
      </div>

      {showError && Boolean(errorMessage) ? (
        <p className="field-error">{errorMessage}</p>
      ) : null}
    </div>
  );
};

