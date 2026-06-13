// Placeholder service layer — replace with real backend integrations later.
// Each function intentionally returns mock data so the UI can be wired now
// and connected to real APIs (Lovable Cloud, Google Sheets, YouTube Data API,
// editing software backend, Apache Guacamole / RDP gateway) later.

export const youtubeService = {
  async connect(_channelId: string) {
    return { ok: false, message: "YouTube API not yet connected" };
  },
  async fetchAnalytics(_channelId: string) {
    return null;
  },
};

export const sheetsService = {
  async sync(_sheetKey: string) {
    return { ok: true, syncedAt: new Date().toISOString() };
  },
  async pushChanges(_sheetKey: string, _rows: unknown) {
    return { ok: true };
  },
};

export const rdpService = {
  async connect(_machineId: string) {
    return { ok: false, message: "RDP gateway not configured" };
  },
  async disconnect(_sessionId: string) {
    return { ok: true };
  },
};

export const editingService = {
  async openProject(_projectId: string) {
    return { ok: false, message: "Editing backend not connected" };
  },
};

export const authService = {
  async login(_email: string, _password: string) {
    return { ok: true };
  },
  async forgotPassword(_email: string) {
    return { ok: true };
  },
};