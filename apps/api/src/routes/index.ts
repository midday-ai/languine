import { Hono } from "hono";
// import authRouter from "./auth";
import feedbackRouter from "./feedback";
import fineTuneRouter from "./fine-tune";
import projectsRouter from "./projects";
import teamsRouter from "./teams";
import telemetryRouter from "./telemetry";
import translateRouter from "./translate";
import usersRouter from "./users";

const router = new Hono();

// router.route("/api/auth", authRouter);
router.route("/telemetry", telemetryRouter);
router.route("/fine-tune", fineTuneRouter);
router.route("/feedback", feedbackRouter);
router.route("/translate", translateRouter);
router.route("/users", usersRouter);
router.route("/projects", projectsRouter);
router.route("/teams", teamsRouter);

export default router;
