import { StylesConfig } from "react-select";

export const selectStyles: StylesConfig = {
  control: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: "var(--color-input-bg)",
    color: "var(--color-text)",
    borderColor: isFocused ? "var(--color-accent)" : "var(--color-input-border)",
    boxShadow: "none",
    minHeight: "36px",
    "&:hover": {
      borderColor: "var(--color-accent)",
    },
  }),
  option: (styles, { isSelected }: { isFocused: boolean; isSelected: boolean }) => ({
    ...styles,
    backgroundColor: isSelected ? "var(--color-select-bg-selected)" : "transparent",
    color: "var(--color-select-text)",
    "&:hover": {
      backgroundColor: "var(--color-select-bg-hover)",
    },
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "var(--color-text)",
  }),
  placeholder: (styles) => ({
    ...styles,
    color: "var(--color-text-muted)",
  }),
  indicatorSeparator: (style) => ({
    ...style,
    display: "none",
  }),
  clearIndicator: (style) => ({
    ...style,
    padding: "8px 0",
    transform: "scale(0.8)",
  }),
  dropdownIndicator: (style) => ({
    ...style,
    paddingLeft: "0",
    color: "var(--color-text)",
  }),
  menu: (style) => ({
    ...style,
    marginTop: "0",
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--color-shadow)",
  }),
  menuList: (style) => ({
    ...style,
    backgroundColor: "var(--color-surface)",
  }),
};
