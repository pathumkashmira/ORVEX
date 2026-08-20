import { useEffect, useMemo, useState } from "react";
import { Bell, BriefcaseBusiness, CheckCircle2, ChevronRight, CircleAlert, Clock3, FolderPlus, LayoutDashboard, ListTodo, Plus, RefreshCw, Search, Users, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { createProject, createTask, getStudioOverview, markNotificationRead, updateProjectStatus, updateTaskStatus } from "@/lib/studio";
import type { AppRole, ProjectStatus, StudioProject, StudioTask, TaskPriority, TaskStatus } from "@/types/studio";

type Tab = "overview" | "team" | "projects" | "tasks";

const PROJECT_STATUSES: ProjectStatus[] = ["LEAD", "DISCOVERY", "QUOTATION", "APPROVED", "PLANNING", "IN_PRODUCTION", "INTERNAL_REVIEW", "CLIENT_REVIEW", "REVISION", "FINAL_DELIVERY", "COMPLETED", "ARCHIVED"];
const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "INTERNAL_REVIEW", "REVISION_REQUIRED", "APPROVED", "COMPLETED"];
const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const INTERNAL_ROLES: AppRole[] = ["SUPER_ADMIN", "ADMIN", "PROJECT_LEAD", "TEAM_COLLABORATOR"];

function money(value: number | null) {
  if (value == null) return "—";
  return `LKR ${value.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}
function date(value: string | null) {
  if (!value) return "No deadline";
  return new Date(value).toLocaleDateString("en-LK", { day: "2-digit", month: "short", year: "numeric" });
}
function badgeClass(value: string) {
  return `studio-badge studio-${value.toLowerCase().replaceAll("_", "-")}`;
}

export default function StudioOSDashboard() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [tasks, setTasks] = useState<StudioTask[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"project" | "task" | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getStudioOverview();
      setProjects(result.projects);
      setTasks(result.tasks);
      setTeam(result.team);
      setNotifications(result.notifications);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Studio OS data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const visibleProjects = useMemo(() => projects.filter((p) => `${p.project_code} ${p.name} ${p.category ?? ""}`.toLowerCase().includes(query.toLowerCase())), [projects, query]);
  const visibleTasks = useMemo(() => tasks.filter((t) => `${t.title} ${t.description ?? ""}`.toLowerCase().includes(query.toLowerCase())), [tasks, query]);
  const activeProjects = projects.filter((p) => !["COMPLETED", "ARCHIVED"].includes(p.status));
  const openTasks = tasks.filter((t) => !["COMPLETED", "APPROVED"].includes(t.status));
  const overdueTasks = tasks.filter((t) => t.deadline && new Date(t.deadline).getTime() < Date.now() && !["COMPLETED", "APPROVED"].includes(t.status));
  const unread = notifications.filter((n) => !n.read_at);

  if (!user || !INTERNAL_ROLES.includes(user.role as AppRole)) return null;

  return (
    <div className="studio-os-shell">
      <style>{CSS}</style>
      <header className="studio-topbar">
        <div className="studio-brand"><div className="studio-mark">O</div><div><strong>ORVEX</strong><span>STUDIO OS</span></div></div>
        <div className="studio-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, tasks, team..." /></div>
        <div className="studio-user"><button className="studio-icon" onClick={() => setTab("overview")} title="Notifications"><Bell size={17} />{unread.length > 0 && <i>{unread.length}</i>}</button><div><b>{user.name}</b><span>{user.role.replaceAll("_", " ")}</span></div></div>
      </header>

      <div className="studio-body">
        <aside className="studio-sidebar">
          {([["overview", LayoutDashboard, "Overview"], ["team", Users, "Team"], ["projects", BriefcaseBusiness, "Projects"], ["tasks", ListTodo, "Tasks"]] as const).map(([key, Icon, label]) => (
            <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}><Icon size={17} />{label}</button>
          ))}
          <div className="studio-side-bottom"><button onClick={load}><RefreshCw size={16} />Refresh</button></div>
        </aside>

        <main className="studio-main">
          <div className="studio-heading"><div><span className="studio-eyebrow">OPERATIONS / {tab.toUpperCase()}</span><h1>{tab === "overview" ? "Studio Command Center" : tab[0].toUpperCase() + tab.slice(1)}</h1><p>Manage ORVEX production from one workspace.</p></div><div className="studio-actions">{tab === "projects" && <button className="studio-primary" onClick={() => setModal("project")}><Plus size={16} /> New Project</button>}{tab === "tasks" && <button className="studio-primary" onClick={() => setModal("task")}><Plus size={16} /> New Task</button>}</div></div>
          {error && <div className="studio-error"><CircleAlert size={17} />{error}<button onClick={load}>Retry</button></div>}
          {loading ? <div className="studio-loading"><RefreshCw className="spin" /> Loading Studio OS...</div> : tab === "overview" ? <Overview projects={projects} tasks={tasks} team={team} notifications={notifications} unread={unread} setTab={setTab} markRead={async (id) => { await markNotificationRead(id); await load(); }} /> : tab === "team" ? <Team team={team} /> : tab === "projects" ? <Projects projects={visibleProjects} onStatus={async (id, status) => { await updateProjectStatus(id, status); await load(); }} /> : <Tasks tasks={visibleTasks} projects={projects} onStatus={async (id, status) => { await updateTaskStatus(id, status); await load(); }} />}
        </main>
      </div>

      {modal === "project" && <ProjectModal onClose={() => setModal(null)} onCreated={async () => { setModal(null); await load(); }} />}
      {modal === "task" && <TaskModal projects={projects} onClose={() => setModal(null)} onCreated={async () => { setModal(null); await load(); }} />}
    </div>
  );
}

function Overview({ projects, tasks, team, notifications, unread, setTab, markRead }: any) {
  const active = projects.filter((p: StudioProject) => !["COMPLETED", "ARCHIVED"].includes(p.status)).length;
  const open = tasks.filter((t: StudioTask) => !["COMPLETED", "APPROVED"].includes(t.status)).length;
  const overdue = tasks.filter((t: StudioTask) => t.deadline && new Date(t.deadline).getTime() < Date.now() && !["COMPLETED", "APPROVED"].includes(t.status)).length;
  const unreadCount = unread.length;
  return <>
    <div className="studio-stats">{[["Active Projects", active, BriefcaseBusiness], ["Open Tasks", open, ListTodo], ["Team Members", team.length, Users], ["Overdue", overdue, CircleAlert]].map(([label, value, Icon]: any) => <div className="studio-stat" key={label}><Icon size={19} /><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="studio-grid-2">
      <section className="studio-panel"><PanelHead title="Production pipeline" action="Projects" onClick={() => setTab("projects")} />{projects.slice(0, 6).map((p: StudioProject) => <div className="studio-row" key={p.id}><div><b>{p.name}</b><span>{p.project_code} · {p.category ?? "General"}</span></div><span className={badgeClass(p.status)}>{p.status.replaceAll("_", " ")}</span></div>)}{projects.length === 0 && <Empty text="No projects yet." />}</section>
      <section className="studio-panel"><PanelHead title="Task queue" action="Tasks" onClick={() => setTab("tasks")} />{tasks.slice(0, 6).map((t: StudioTask) => <div className="studio-row" key={t.id}><div><b>{t.title}</b><span>{date(t.deadline)}</span></div><span className={badgeClass(t.priority)}>{t.priority}</span></div>)}{tasks.length === 0 && <Empty text="No tasks yet." />}</section>
    </div>
    <div className="studio-grid-2">
      <section className="studio-panel"><PanelHead title="Notifications" action={`${unreadCount} unread`} /><>{notifications.slice(0, 7).map((n: any) => <button className={`studio-notification ${!n.read_at ? "unread" : ""}`} key={n.id} onClick={() => !n.read_at && markRead(n.id)}><Bell size={15}/><div><b>{n.title}</b><span>{n.body ?? n.event_type}</span></div><ChevronRight size={14}/></button>)}</>{notifications.length === 0 && <Empty text="No notifications." />}</section>
      <section className="studio-panel"><PanelHead title="Team pulse" action="Team" onClick={() => setTab("team")} />{team.slice(0, 7).map((m: any) => <div className="studio-row" key={m.user_id}><div><b>{m.user_id.slice(0, 8)}…</b><span>{m.status}</span></div><div className="workload"><span style={{ width: `${Math.min(100, Number(m.current_workload) || 0)}%` }} /></div></div>)}{team.length === 0 && <Empty text="No team members yet." />}</section>
    </div>
  </>;
}

function Team({ team }: { team: any[] }) {
  return <section className="studio-panel"><PanelHead title="Collaborators" action={`${team.length} records`} /><div className="studio-table"><div className="studio-thead"><span>Member</span><span>Status</span><span>Workload</span><span>Projects</span><span>Rate</span></div>{team.map((m) => <div className="studio-trow" key={m.user_id}><div><b>{m.user_id.slice(0, 8)}…</b><span>Profile ID</span></div><span className={badgeClass(m.status)}>{m.status}</span><div className="workload"><span style={{ width: `${Math.min(100, Number(m.current_workload) || 0)}%` }}/><small>{Number(m.current_workload) || 0}%</small></div><span>{m.completed_projects ?? 0}</span><span>{money(m.rate)}</span></div>)}{team.length === 0 && <Empty text="No collaborators are registered yet." />}</div></section>;
}

function Projects({ projects, onStatus }: { projects: StudioProject[]; onStatus: (id: string, status: ProjectStatus) => Promise<void> }) {
  return <section className="studio-panel"><PanelHead title="Projects" action={`${projects.length} visible`} /><div className="studio-table"><div className="studio-thead"><span>Project</span><span>Status</span><span>Priority</span><span>Deadline</span><span>Budget</span></div>{projects.map((p) => <div className="studio-trow" key={p.id}><div><b>{p.name}</b><span>{p.project_code} · {p.category ?? "General"}</span></div><select value={p.status} onChange={(e) => void onStatus(p.id, e.target.value as ProjectStatus)}>{PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select><span className={badgeClass(p.priority)}>{p.priority}</span><span>{date(p.deadline)}</span><span>{money(p.budget)}</span></div>)}{projects.length === 0 && <Empty text="No projects match your search." />}</div></section>;
}

function Tasks({ tasks, projects, onStatus }: { tasks: StudioTask[]; projects: StudioProject[]; onStatus: (id: string, status: TaskStatus) => Promise<void> }) {
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Unknown project";
  return <section className="studio-panel"><PanelHead title="Tasks" action={`${tasks.length} visible`} /><div className="studio-table"><div className="studio-thead"><span>Task</span><span>Status</span><span>Priority</span><span>Project</span><span>Deadline</span></div>{tasks.map((t) => <div className="studio-trow" key={t.id}><div><b>{t.title}</b><span>{t.description ?? "No description"}</span></div><select value={t.status} onChange={(e) => void onStatus(t.id, e.target.value as TaskStatus)}>{TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}</select><span className={badgeClass(t.priority)}>{t.priority}</span><span>{projectName(t.project_id)}</span><span>{date(t.deadline)}</span></div>)}{tasks.length === 0 && <Empty text="No tasks match your search." />}</div></section>;
}

function ProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const [form, setForm] = useState({ project_code: "", name: "", description: "", category: "", priority: "MEDIUM" as TaskPriority, budget: "", deadline: "" });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await createProject({ ...form, budget: form.budget ? Number(form.budget) : null, deadline: form.deadline || null }); await onCreated(); } finally { setSaving(false); } };
  return <Modal title="Create project" onClose={onClose}><form onSubmit={submit}>{[["project_code", "Project ID"], ["name", "Project name"], ["category", "Category"]].map(([key, label]) => <label key={key}>{label}<input required={key !== "category"} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}/></label>)}<label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label><div className="studio-form-grid"><label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label><label>Budget<input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}/></label></div><label>Deadline<input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}/></label><div className="studio-modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="studio-primary" disabled={saving}>{saving ? "Creating..." : "Create project"}</button></div></form></Modal>;
}

function TaskModal({ projects, onClose, onCreated }: { projects: StudioProject[]; onClose: () => void; onCreated: () => Promise<void> }) {
  const [form, setForm] = useState({ project_id: projects[0]?.id ?? "", title: "", description: "", priority: "MEDIUM" as TaskPriority, budget: "", deadline: "", deliverables: "" });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await createTask({ ...form, budget: form.budget ? Number(form.budget) : null, deadline: form.deadline || null, deliverables: form.deliverables.split("\n").map((x) => x.trim()).filter(Boolean) }); await onCreated(); } finally { setSaving(false); } };
  return <Modal title="Create task" onClose={onClose}><form onSubmit={submit}><label>Project<select required value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>{projects.map((p) => <option key={p.id} value={p.id}>{p.project_code} — {p.name}</option>)}</select></label><label>Task title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label><div className="studio-form-grid"><label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label><label>Budget<input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}/></label></div><label>Deadline<input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}/></label><label>Deliverables <span className="hint">one per line</span><textarea value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })}/></label><div className="studio-modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="studio-primary" disabled={saving || !projects.length}>{saving ? "Creating..." : "Create task"}</button></div></form></Modal>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="studio-modal-backdrop"><div className="studio-modal"><div className="studio-modal-head"><h2>{title}</h2><button onClick={onClose}><X size={18}/></button></div>{children}</div></div>; }
function PanelHead({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="studio-panel-head"><h2>{title}</h2>{action && <button onClick={onClick}>{action}{onClick && <ChevronRight size={14}/>}</button>}</div>; }
function Empty({ text }: { text: string }) { return <div className="studio-empty"><Clock3 size={18}/><span>{text}</span></div>; }

const CSS = `
.studio-os-shell{min-height:100vh;background:#090b0f;color:#e7ebef;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}.studio-topbar{height:68px;border-bottom:1px solid #20252c;background:#0d1015;display:flex;align-items:center;padding:0 24px;gap:24px;position:sticky;top:0;z-index:20}.studio-brand{display:flex;align-items:center;gap:10px;min-width:180px}.studio-brand strong{display:block;letter-spacing:.16em;font-size:13px}.studio-brand span{display:block;color:#707883;font-size:9px;letter-spacing:.18em;margin-top:2px}.studio-mark{width:32px;height:32px;border:1px solid #f05a28;border-radius:8px;display:grid;place-items:center;color:#f05a28;font-weight:800}.studio-search{max-width:520px;flex:1;margin:auto;display:flex;align-items:center;gap:9px;background:#15191f;border:1px solid #272d35;border-radius:8px;padding:9px 12px;color:#737b86}.studio-search input{border:0;outline:0;background:none;color:#e7ebef;width:100%;font:inherit;font-size:13px}.studio-user{display:flex;align-items:center;gap:12px;min-width:190px;justify-content:flex-end}.studio-user b,.studio-user span{display:block}.studio-user b{font-size:12px}.studio-user span{font-size:9px;color:#737b86;margin-top:3px}.studio-icon{position:relative;background:none;border:0;color:#aab1ba;cursor:pointer}.studio-icon i{position:absolute;right:-6px;top:-6px;background:#f05a28;color:#fff;border-radius:10px;font-size:8px;padding:2px 5px;font-style:normal}.studio-body{display:flex;min-height:calc(100vh - 68px)}.studio-sidebar{width:210px;border-right:1px solid #20252c;background:#0c0f13;padding:18px 12px;display:flex;flex-direction:column;gap:5px}.studio-sidebar button{display:flex;align-items:center;gap:11px;width:100%;border:0;background:none;color:#777f89;padding:11px 12px;border-radius:7px;text-align:left;cursor:pointer;font:500 12px Inter}.studio-sidebar button:hover,.studio-sidebar button.active{background:#171b21;color:#f0f2f4}.studio-sidebar button.active{box-shadow:inset 2px 0 #f05a28}.studio-side-bottom{margin-top:auto}.studio-main{flex:1;padding:30px;max-width:1500px;width:100%;margin:auto}.studio-heading{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:25px}.studio-eyebrow{font-size:9px;letter-spacing:.18em;color:#f05a28;font-weight:700}.studio-heading h1{font-size:28px;letter-spacing:-.04em;margin:8px 0 5px}.studio-heading p{margin:0;color:#707883;font-size:12px}.studio-actions{display:flex;gap:8px}.studio-primary{background:#f05a28!important;color:#fff!important;border:1px solid #f05a28!important;border-radius:7px;padding:10px 14px;display:flex;align-items:center;gap:7px;font:600 12px Inter;cursor:pointer}.studio-primary:disabled{opacity:.5;cursor:not-allowed}.studio-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.studio-stat{background:#101419;border:1px solid #222831;border-radius:9px;padding:17px;position:relative}.studio-stat svg{color:#f05a28;position:absolute;right:16px;top:17px}.studio-stat span{display:block;color:#747c87;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.studio-stat strong{display:block;font-size:27px;margin-top:12px}.studio-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.studio-panel{background:#101419;border:1px solid #222831;border-radius:9px;overflow:hidden}.studio-panel-head{height:52px;border-bottom:1px solid #20252c;padding:0 17px;display:flex;align-items:center;justify-content:space-between}.studio-panel-head h2{font-size:12px;margin:0}.studio-panel-head button{border:0;background:none;color:#747c87;font-size:10px;display:flex;align-items:center;gap:4px;cursor:pointer}.studio-row{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;border-bottom:1px solid #1c2128;gap:14px}.studio-row:last-child{border-bottom:0}.studio-row b,.studio-row span{display:block}.studio-row b{font-size:12px;font-weight:600}.studio-row div span{font-size:10px;color:#6f7782;margin-top:4px}.studio-badge{display:inline-flex!important;align-items:center;border:1px solid #303740;border-radius:99px;padding:4px 7px;font-size:8px!important;letter-spacing:.04em;white-space:nowrap}.studio-completed,.studio-approved{color:#57c98a;border-color:#24573e;background:#10271d}.studio-in-production,.studio-in-progress,.studio-planning{color:#6eb6ff;border-color:#214a70;background:#0d1d2c}.studio-revision,.studio-revision-required,.studio-urgent,.studio-blocked{color:#ff8a72;border-color:#633126;background:#2b1511}.studio-todo,.studio-medium{color:#d5a84b}.studio-high{color:#ffb45c}.studio-low{color:#84909e}.studio-lead,.studio-discovery,.studio-quotation{color:#b99aff}.studio-notification{width:100%;display:flex;gap:10px;align-items:flex-start;padding:12px 17px;background:none;border:0;border-bottom:1px solid #1c2128;color:#737b86;text-align:left;cursor:pointer}.studio-notification.unread{background:#121820;color:#cbd2da}.studio-notification svg{margin-top:2px;flex:none}.studio-notification div{flex:1}.studio-notification b,.studio-notification span{display:block}.studio-notification b{font-size:11px;color:#e3e7eb}.studio-notification span{font-size:10px;margin-top:3px}.workload{height:6px;background:#20262e;border-radius:99px;min-width:90px;overflow:hidden}.workload span{display:block;height:100%;background:#f05a28;border-radius:99px}.studio-table{overflow:auto}.studio-thead,.studio-trow{min-width:800px;display:grid;grid-template-columns:2fr 1.1fr 1fr 1.3fr 1.1fr;gap:14px;align-items:center;padding:13px 17px}.studio-thead{background:#0c0f13;color:#68717c;text-transform:uppercase;font-size:8px;letter-spacing:.1em}.studio-trow{border-top:1px solid #1c2128;font-size:11px}.studio-trow b,.studio-trow span{display:block}.studio-trow div span{font-size:9px;color:#68717c;margin-top:4px}.studio-trow select{background:#151a20;border:1px solid #2a3139;color:#cdd3d9;border-radius:6px;padding:6px 7px;font-size:9px;max-width:150px}.studio-error{display:flex;align-items:center;gap:9px;background:#251411;border:1px solid #6a2b20;color:#ff9b87;padding:12px 14px;border-radius:7px;font-size:11px;margin-bottom:18px}.studio-error button{margin-left:auto;background:none;border:0;color:#ffb3a4;cursor:pointer}.studio-loading,.studio-empty{min-height:180px;display:flex;align-items:center;justify-content:center;gap:9px;color:#6d7681;font-size:11px}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.studio-modal-backdrop{position:fixed;inset:0;background:#000b;display:grid;place-items:center;z-index:50;padding:20px}.studio-modal{width:min(560px,100%);max-height:90vh;overflow:auto;background:#11151a;border:1px solid #2a3139;border-radius:10px;box-shadow:0 25px 80px #000; padding:20px}.studio-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.studio-modal-head h2{font-size:17px;margin:0}.studio-modal-head button{background:none;border:0;color:#7b848f;cursor:pointer}.studio-modal form{display:grid;gap:13px}.studio-modal label{display:grid;gap:6px;color:#858e99;font-size:10px;text-transform:uppercase;letter-spacing:.06em}.studio-modal input,.studio-modal textarea,.studio-modal select{width:100%;box-sizing:border-box;background:#0b0e12;border:1px solid #293039;border-radius:6px;color:#e8ebee;padding:10px;font:12px Inter;outline:none}.studio-modal textarea{min-height:80px;resize:vertical}.studio-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.studio-modal .hint{color:#4f5863;text-transform:none;letter-spacing:0}.studio-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:5px}.studio-modal-actions>button:not(.studio-primary){background:#171c22;border:1px solid #2b323a;color:#9ca5af;border-radius:7px;padding:9px 13px;cursor:pointer;font-size:11px}
@media(max-width:900px){.studio-sidebar{width:64px;padding:14px 8px}.studio-sidebar button{justify-content:center;font-size:0}.studio-sidebar button svg{width:18px}.studio-stats{grid-template-columns:1fr 1fr}.studio-grid-2{grid-template-columns:1fr}.studio-user>div{display:none}.studio-main{padding:20px}.studio-search{max-width:none}.studio-brand{min-width:auto}.studio-brand div:not(.studio-mark){display:none}}
@media(max-width:600px){.studio-topbar{padding:0 12px;gap:10px}.studio-search{display:none}.studio-heading{align-items:flex-start;gap:14px}.studio-heading h1{font-size:23px}.studio-stats{grid-template-columns:1fr 1fr}.studio-main{padding:15px}.studio-form-grid{grid-template-columns:1fr}.studio-user{min-width:auto}.studio-sidebar{position:fixed;bottom:0;left:0;right:0;width:auto;height:58px;z-index:30;flex-direction:row;justify-content:space-around;border-right:0;border-top:1px solid #20252c}.studio-sidebar button{width:auto;padding:8px 15px}.studio-side-bottom{display:none}.studio-body{padding-bottom:58px}.studio-heading .studio-actions{position:fixed;right:15px;bottom:72px;z-index:25}.studio-primary{padding:9px 11px}}
`;
