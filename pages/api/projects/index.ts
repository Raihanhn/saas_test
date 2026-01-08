//pages/api/projects/index.ts
import { connectDB } from "@/lib/db";
import projectRoutes from "@/modules/projects/project.routes";

connectDB();

export default projectRoutes;
