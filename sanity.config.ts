import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import article from "./schemaTypes/article";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your_project_id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "dzwire-studio",
  title: "DzWire Editorial Desk",
  basePath: "/studio", // Mounts Sanity Studio on this sub-route
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: [article],
  },
});
