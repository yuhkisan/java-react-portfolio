import { Chip } from "@mui/material";
import type { Severity } from "../../types/viewModel";

export const SeverityChip = ({ severity }: { severity: Severity }) => {
  let color: "error" | "warning" | "info" | "success" = "info";
  if (severity === "Critical" || severity === "High") color = "error";
  if (severity === "Medium") color = "warning";
  return (
    <Chip
      label={severity}
      color={color}
      size="small"
      variant={severity === "Critical" ? "filled" : "outlined"}
      sx={{ fontWeight: "bold", minWidth: 80 }}
    />
  );
};
