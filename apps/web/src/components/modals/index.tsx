import { ChangePlanModal } from "./change-plan";
import { CreateProjectModal } from "./create-project";
import { CreateTeamModal } from "./create-team";
import { InviteModal } from "./invite";

export function GlobalModals() {
  return (
    <>
      <CreateProjectModal />
      <CreateTeamModal />
      <InviteModal />
      <ChangePlanModal />
    </>
  );
}
