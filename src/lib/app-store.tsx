import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_CHANNELS,
  MOCK_NOTIFICATIONS,
  MOCK_SHEET_DATA,
  MOCK_USERS,
} from "./mock-data";
import type { Channel, Notification, Role, SheetRow, User } from "./types";

type Theme = "light" | "dark";

interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

interface AppStore {
  ready: boolean;
  // auth
  user: AuthUser | null;
  login: (u: AuthUser) => void;
  logout: () => void;
  // theme
  theme: Theme;
  toggleTheme: () => void;
  // sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  // data
  channels: Channel[];
  addChannel: (c: Channel) => void;
  updateChannel: (id: string, patch: Partial<Channel>) => void;
  sheets: Record<string, SheetRow[]>;
  updateSheet: (key: string, rows: SheetRow[]) => void;
  addSheetRow: (key: string, row: SheetRow) => void;
  updateSheetCell: (key: string, rowId: string, field: string, value: string | number) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  users: User[];
  addUser: (u: User) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  // dashboard config
  dashboardCards: Record<string, boolean>;
  toggleCard: (id: string) => void;
}

const Ctx = createContext<AppStore | null>(null);

const LS_KEY = "orvion.state.v2";

function readPersisted() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [sheets, setSheets] = useState<Record<string, SheetRow[]>>(
    MOCK_SHEET_DATA,
  );
  const [notifications, setNotifications] = useState<Notification[]>(
    MOCK_NOTIFICATIONS,
  );
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [dashboardCards, setDashboardCards] = useState<Record<string, boolean>>(
    {
      projects: true,
      team: true,
      tasks: true,
      sheets: true,
      activity: true,
      notifications: true,
      kpi: true,
      quickLinks: true,
      hr: true,
      finance: true,
      it: true,
      editing: true,
    },
  );

  useEffect(() => {
    const persisted = readPersisted();
    if (persisted) {
      setUser(persisted.user ?? null);
      setTheme(persisted.theme ?? "dark");
      setChannels(persisted.channels ?? MOCK_CHANNELS);
      setSheets(persisted.sheets ?? MOCK_SHEET_DATA);
      setNotifications(persisted.notifications ?? MOCK_NOTIFICATIONS);
      setUsers(persisted.users ?? MOCK_USERS);
      setDashboardCards(persisted.dashboardCards ?? dashboardCards);
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist
  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    window.localStorage.setItem(
      LS_KEY,
      JSON.stringify({ user, theme, channels, sheets, notifications, users, dashboardCards }),
    );
  }, [ready, user, theme, channels, sheets, notifications, users, dashboardCards]);

  // theme class on <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const updateSheetCell = useCallback(
    (key: string, rowId: string, field: string, value: string | number) => {
      setSheets((prev) => ({
        ...prev,
        [key]: (prev[key] ?? []).map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
      }));
    },
    [],
  );

  const value: AppStore = useMemo(
    () => ({
      ready,
      user,
      login: (u) => setUser(u),
      logout: () => setUser(null),
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      sidebarOpen,
      setSidebarOpen,
      channels,
      addChannel: (c) => setChannels((prev) => [...prev, c]),
      updateChannel: (id, patch) =>
        setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      sheets,
      updateSheet: (key, rows) => setSheets((prev) => ({ ...prev, [key]: rows })),
      addSheetRow: (key, row) =>
        setSheets((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), row] })),
      updateSheetCell,
      notifications,
      markNotificationRead: (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
      markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
      users,
      addUser: (u) => setUsers((prev) => [...prev, u]),
      updateUser: (id, patch) =>
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u))),
      dashboardCards,
      toggleCard: (id) =>
        setDashboardCards((prev) => ({ ...prev, [id]: !prev[id] })),
    }),
    [ready, user, theme, sidebarOpen, channels, sheets, notifications, users, dashboardCards, updateSheetCell],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppStoreProvider");
  return ctx;
}