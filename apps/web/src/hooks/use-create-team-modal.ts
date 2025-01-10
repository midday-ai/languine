import { parseAsBoolean, useQueryState } from "nuqs";

export function useCreateTeamModal() {
  const [open, setOpen] = useQueryState(
    "create-team",
    parseAsBoolean.withDefault(false),
  );

  return {
    open,
    setOpen,
  };
}
