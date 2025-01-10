import { parseAsBoolean, useQueryState } from "nuqs";

export function useInviteModal() {
  const [open, setOpen] = useQueryState(
    "invite",
    parseAsBoolean.withDefault(false),
  );

  return {
    open,
    setOpen,
  };
}
