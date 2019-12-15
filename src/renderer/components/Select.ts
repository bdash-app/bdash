import { StylesConfig } from "react-select";

export const selectStyles: StylesConfig = {
  option: (styles, { isSelected }: { isFocused: boolean; isSelected: boolean }) => ({
    ...styles,
    backgroundColor: isSelected ? "#f5faff" : "transparent",
    color: "black",
    "&:hover": {
      backgroundColor: "#ebf5ff"
    }
  }),
  indicatorSeparator: style => ({
    ...style,
    display: "none"
  }),
  clearIndicator: style => ({
    ...style,
    padding: "8px 0",
    transform: "scale(0.8)"
  }),
  dropdownIndicator: style => ({
    ...style,
    paddingLeft: "0"
  }),
  menu: style => ({
    ...style,
    marginTop: "0"
  })
};
