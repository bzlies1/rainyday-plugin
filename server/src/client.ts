export class RainydayClient {
  constructor(
    private baseUrl: string,
    private token: string,
  ) {}

  private async request(path: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error ?? `HTTP ${response.status}`);
    }

    return body.data;
  }

  async listProjects() {
    return this.request("/api/projects");
  }

  async getProject(shortcode: string) {
    return this.request(`/api/projects/${shortcode}`);
  }

  async listItems(
    project: string,
    filters?: { status?: string[]; priority?: string[] },
  ) {
    const params = new URLSearchParams({ project });
    filters?.status?.forEach((s) => params.append("status", s));
    filters?.priority?.forEach((p) => params.append("priority", p));
    return this.request(`/api/items?${params}`);
  }

  async getItem(identifier: string) {
    return this.request(`/api/items/${identifier}`);
  }

  async createItem(data: {
    project: string;
    title: string;
    type?: string;
    priority?: string;
    description?: string;
    parentIdentifier?: string;
  }) {
    return this.request("/api/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateItem(identifier: string, data: Record<string, unknown>) {
    return this.request(`/api/items/${identifier}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async listComments(identifier: string) {
    return this.request(`/api/items/${identifier}/comments`);
  }

  async addComment(identifier: string, body: string) {
    return this.request(`/api/items/${identifier}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }

  async search(query: string, project?: string) {
    const params = new URLSearchParams({ q: query });
    if (project) params.set("project", project);
    return this.request(`/api/search?${params}`);
  }
}
