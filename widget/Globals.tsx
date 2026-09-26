import GLib from "gi://GLib"
import { createSubprocess, execAsync } from "ags/process"
import { createComputed, type Accessor } from "ags"

// ---- compositor detection -------------------------------------------------

export type Compositor = "niri" | "mango"

function detectCompositor(): Compositor {
    if (GLib.getenv("MANGO_INSTANCE_SIGNATURE")) return "mango"
    if (GLib.getenv("NIRI_SOCKET")) return "niri"
    const desktop = (GLib.getenv("XDG_CURRENT_DESKTOP") ?? "").toLowerCase()
    if (desktop.includes("mango")) return "mango"
    return "niri"
}

export const compositor: Compositor = detectCompositor()

// ---- shared state shape (produced by scripts/<compositor>_state.sh) ---------

export type Workspace = {
    idx: number
    id: number
    output: string
    is_active: boolean
}

export type Window = {
    id: number
    title: string | null
    app_id: string | null
    is_focused: boolean
    workspace_id: number | null
    output: string | null
}

type State = {
    workspaces: Workspace[]
    windows: Window[]
}

const EMPTY: State = { workspaces: [], windows: [] }

const state: Accessor<State> = createSubprocess<State>(
    EMPTY,
    ["bash", "-c", `${SRC}/scripts/${compositor}_state.sh`],
    (stdout) => {
        try {
            return JSON.parse(stdout.trim()) as State
        } catch (e) {
            console.error(`failed to parse ${compositor} state:`, e, stdout)
            return EMPTY
        }
    },
)

export const workspaces: Accessor<Workspace[]> =
    createComputed(() => state().workspaces)

export const windows: Accessor<Window[]> =
    createComputed(() => state().windows)

// ---- compositor actions ----------------------------------------------------

export async function focusWorkspace(ws: Workspace) {
    switch (compositor) {
        case "mango":
            // tags are per-monitor and `view` acts on the focused monitor
            await execAsync(["mmsg", "dispatch", `focusmon,${ws.output}`])
            await execAsync(["mmsg", "dispatch", `view,${ws.idx},0`])
            return
        case "niri":
            await execAsync(["niri", "msg", "action", "focus-workspace", String(ws.idx)])
            return
    }
}

export async function focusWindow(win: Window) {
    switch (compositor) {
        case "mango":
            await execAsync(["mmsg", "dispatch", "focusid", `client,${win.id}`])
            return
        case "niri":
            await execAsync(["niri", "msg", "action", "focus-window", "--id", String(win.id)])
            return
    }
}

export const quitCommand: string[] =
    compositor === "mango"
        ? ["mmsg", "dispatch", "quit"]
        : ["niri", "msg", "action", "quit"]
