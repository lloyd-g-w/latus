import { createSubprocess } from "ags/process"
import { createComputed, type Accessor } from "ags"

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
}

type NiriState = {
    workspaces: Workspace[]
    windows: Window[]
}

const niriState: Accessor<NiriState> = createSubprocess<NiriState>(
    { workspaces: [], windows: [] },
    ["bash", "-c", `${SRC}/scripts/niri_state.sh`],
    (stdout) => {
        try {
            return JSON.parse(stdout.trim()) as NiriState
        } catch (e) {
            console.error("failed to parse niri state:", e, stdout)
            return { workspaces: [], windows: [] }
        }
    },
)

// Accessor #1
export const niriWorkspaces: Accessor<Workspace[]> =
    createComputed(() => niriState().workspaces)

// Accessor #2
export const niriWindows: Accessor<Window[]> =
    createComputed(() => niriState().windows)
