#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { RainydayClient } from "./client.js";

const apiUrl = process.env.RAINYDAY_API_URL;
const apiToken = process.env.RAINYDAY_API_TOKEN;

if (!apiUrl || !apiToken) {
  console.error(
    "Missing required environment variables: RAINYDAY_API_URL, RAINYDAY_API_TOKEN",
  );
  process.exit(1);
}

const client = new RainydayClient(apiUrl, apiToken);

const server = new McpServer({
  name: "rainyday",
  version: "1.0.0",
});

// ─── Tools ───────────────────────────────────────────────

server.registerTool("list_projects", {
  description: "List all projects in the workspace",
}, async () => {
  const projects = await client.listProjects();
  return {
    content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
  };
});

server.registerTool("list_items", {
  description:
    "List items in a project, optionally filtered by status and/or priority",
  inputSchema: {
    project: z.string().describe("Project shortcode (e.g. 'RD')"),
    status: z
      .array(z.string())
      .optional()
      .describe("Filter by status IDs"),
    priority: z
      .array(z.enum(["urgent", "high", "medium", "low", "none"]))
      .optional()
      .describe("Filter by priority levels"),
  },
}, async ({ project, status, priority }) => {
  const items = await client.listItems(project, { status, priority });
  return {
    content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
  };
});

server.registerTool("get_item", {
  description:
    "Get full details of an item including comments. Use identifier like 'RD-42'.",
  inputSchema: {
    identifier: z
      .string()
      .describe("Item identifier (e.g. 'RD-42')"),
  },
}, async ({ identifier }) => {
  const [item, comments] = await Promise.all([
    client.getItem(identifier),
    client.listComments(identifier),
  ]);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ ...item, comments }, null, 2),
      },
    ],
  };
});

server.registerTool("create_item", {
  description: "Create a new item (task, bug, feature, etc.) in a project",
  inputSchema: {
    project: z.string().describe("Project shortcode"),
    title: z.string().describe("Item title"),
    type: z
      .enum(["task", "bug", "feature", "epic", "note"])
      .optional()
      .describe("Item type (default: task)"),
    priority: z
      .enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .describe("Priority level (default: none)"),
    description: z.string().optional().describe("Item description"),
  },
}, async ({ project, title, type, priority, description }) => {
  const item = await client.createItem({
    project,
    title,
    type,
    priority,
    description,
  });
  return {
    content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
  };
});

server.registerTool("update_item", {
  description: "Update fields on an existing item",
  inputSchema: {
    identifier: z.string().describe("Item identifier (e.g. 'RD-42')"),
    title: z.string().optional().describe("New title"),
    status: z.string().optional().describe("New status ID"),
    priority: z
      .enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .describe("New priority"),
    type: z
      .enum(["task", "bug", "feature", "epic", "note"])
      .optional()
      .describe("New item type"),
    description: z.string().optional().describe("New description"),
    dueDate: z
      .number()
      .optional()
      .describe("Due date as Unix timestamp in ms"),
  },
}, async ({ identifier, title, status, priority, type, description, dueDate }) => {
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (status !== undefined) updates.statusId = status;
  if (priority !== undefined) updates.priority = priority;
  if (type !== undefined) updates.type = type;
  if (description !== undefined) updates.description = description;
  if (dueDate !== undefined) updates.dueDate = dueDate;

  const item = await client.updateItem(identifier, updates);
  return {
    content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
  };
});

server.registerTool("add_comment", {
  description: "Add a comment to an item",
  inputSchema: {
    identifier: z.string().describe("Item identifier (e.g. 'RD-42')"),
    body: z.string().describe("Comment text"),
  },
}, async ({ identifier, body }) => {
  const result = await client.addComment(identifier, body);
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
});

server.registerTool("search_items", {
  description: "Search items by text query, optionally scoped to a project",
  inputSchema: {
    query: z.string().describe("Search query"),
    project: z
      .string()
      .optional()
      .describe("Project shortcode to scope search"),
  },
}, async ({ query, project }) => {
  const results = await client.search(query, project);
  return {
    content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
  };
});

server.registerTool("assign_item", {
  description: "Assign a user to an item by their email address",
  inputSchema: {
    identifier: z.string().describe("Item identifier (e.g. 'RD-42')"),
    email: z.string().email().describe("Email of the user to assign"),
  },
}, async ({ identifier, email }) => {
  const item = await client.updateItem(identifier, { assignee: email });
  return {
    content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
  };
});

server.registerTool("create_subtask", {
  description: "Create a sub-task under a parent item",
  inputSchema: {
    parentIdentifier: z
      .string()
      .describe("Parent item identifier (e.g. 'RD-42')"),
    project: z.string().describe("Project shortcode"),
    title: z.string().describe("Subtask title"),
    type: z
      .enum(["task", "bug", "feature", "epic", "note"])
      .optional()
      .describe("Item type (default: task)"),
    priority: z
      .enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .describe("Priority level (default: none)"),
    description: z.string().optional().describe("Subtask description"),
  },
}, async ({ parentIdentifier, project, title, type, priority, description }) => {
  const item = await client.createItem({
    project,
    title,
    type,
    priority,
    description,
    parentIdentifier,
  });
  return {
    content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
  };
});

// ─── Resources ───────────────────────────────────────────

server.registerResource(
  "all_projects",
  "rainyday://projects",
  { description: "List of all projects in the workspace" },
  async () => {
    const projects = await client.listProjects();
    return {
      contents: [
        {
          uri: "rainyday://projects",
          text: JSON.stringify(projects, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  },
);

server.registerResource(
  "project_details",
  new ResourceTemplate("rainyday://projects/{shortcode}", {
    list: undefined,
  }),
  { description: "Details for a specific project by shortcode" },
  async (uri, { shortcode }) => {
    const project = await client.getProject(shortcode as string);
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(project, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  },
);

server.registerResource(
  "item_details",
  new ResourceTemplate("rainyday://items/{identifier}", {
    list: undefined,
  }),
  { description: "Full details for an item by identifier" },
  async (uri, { identifier }) => {
    const [item, comments] = await Promise.all([
      client.getItem(identifier as string),
      client.listComments(identifier as string),
    ]);
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify({ ...item, comments }, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  },
);

// ─── Start ───────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
