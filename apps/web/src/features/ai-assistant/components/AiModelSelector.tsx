import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
} from "@mui/material";
import { AI_MODEL_OPTIONS } from "@supportops/types";
import type { AiModelId } from "../types";

type AiModelSelectorProps = {
  value: AiModelId;
  onChange: (model: AiModelId) => void;
  disabled?: boolean;
};

export function AiModelSelector({ value, onChange, disabled }: AiModelSelectorProps) {
  const handleChange = (e: SelectChangeEvent<string>) => {
    onChange(e.target.value as AiModelId);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <Select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        displayEmpty
        sx={{ fontSize: "0.75rem" }}
      >
        {AI_MODEL_OPTIONS.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            <Typography variant="body2" component="span">
              {option.label}
            </Typography>
            &nbsp;
            <Typography variant="caption" color="text.secondary" component="span">
              ({option.hint})
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
