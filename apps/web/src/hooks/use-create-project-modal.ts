import { parseAsBoolean, useQueryState } from "nuqs";

export function useCreateProjectModal() {
  const [open, setOpen] = useQueryState(
    "create-project",
    parseAsBoolean.withDefault(false),
  );

  return {
    open,
    setOpen,
  };
}
