/**
 * Local Figma "Key-screens" raster/SVG assets (file LVnoU57hooTpIYj8QNAMqJ, node 1:15048 / children).
 * Generated with `node scripts/download-wf-figma-assets.mjs` — re-run that script after updating
 * UUIDs in the script (from a fresh Figma MCP `get_design_context` pass) if images break.
 */
const icon = (file: string) =>
  `${import.meta.env.BASE_URL}wf-figma-key-screens/${file}`;

export const WF_FIGMA = {
  headerLogo: icon("header-logo.svg"),
  headerSearch: icon("header-search.svg"),
  headerGear: icon("header-gear.svg"),
  headerAvatar: icon("header-avatar.jpg"),
  titleJob: icon("title-job.svg"),
  titleArrow: icon("title-arrow.svg"),
  titleStatusDot: icon("title-status-dot.svg"),
  titleUsers: icon("title-users.svg"),
  titleTasks: icon("title-tasks.svg"),
  navSpark: icon("nav-spark.svg"),
  navPathways: icon("nav-pathways.svg"),
  navCompass: icon("nav-compass.svg"),
  navTasks: icon("nav-tasks.svg"),
  navStars: icon("nav-stars.svg"),
  canvasDrag: icon("canvas-drag.svg"),
  canvasArrowConnector: icon("canvas-connector.svg"),
  canvasSalesforce: icon("agent-salesforce.svg"),
  canvasGemini: icon("agent-gemini.svg"),
  canvasMicrosoft: icon("agent-microsoft.svg"),
  agentMicrosoft: icon("agent-microsoft.svg"),
  agentGemini: icon("agent-gemini.svg"),
  agentSalesforce: icon("agent-salesforce.svg"),
  statsPieChart: icon("stat-pie.svg"),
  statsHourglass: icon("stat-hourglass.svg"),
  statsPieChartPage: icon("stat-pie.svg"),
  statsHourglassPage: icon("stat-hourglass.svg"),
} as const;
