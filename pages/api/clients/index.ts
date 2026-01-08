// pages/api/clients/index.ts
import {connectDB} from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import clientRoutes from "@/modules/clients/client.routes";

connectDB(); 

export default withAuth(clientRoutes, { roles: ["admin"] });
