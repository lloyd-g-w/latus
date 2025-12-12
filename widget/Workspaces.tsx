import { Gtk } from "ags/gtk4"
import { execAsync, createSubprocess } from "ags/process"
import { For, type Accessor } from "ags"

type Workspace = {
    idx: number
    output: string
    is_active: boolean
}


const niriWorkspaces: Accessor<Workspace[]> = createSubprocess<Workspace[]>(
    [],                     // initial value
    ["bash", "-c", "scripts/workspaces.sh"],  // same script as in eww
    (stdout) => {
        try {
            const data = JSON.parse(stdout.trim())
            return Array.isArray(data) ? data as Workspace[] : []
        } catch (e) {
            console.error("failed to parse niri workspaces:", e, stdout)
            return []
        }
    },
)

export default function Workspaces({ output }: { output: string }) {
    const workspaces = niriWorkspaces.as<Workspace[]>(wsList =>
        wsList.filter(ws => ws.output === output)
    )

    return (
        <box orientation={Gtk.Orientation.HORIZONTAL}>
            <For each={workspaces}>
                {(ws, i) => (
                    <button
                        class={ws.is_active ? "workspace-btn latus active" : "workspace-btn latus"}
                        onClicked={() =>
                            execAsync([
                                "niri",
                                "msg",
                                "action",
                                "focus-workspace",
                                String(ws.idx),
                            ])
                        }
                    >
                        <label
                            label={
                                String(ws.idx) +
                                (i() < workspaces().length - 1 ? " " : "")
                            }
                        />
                    </button>
                )}
            </For>
        </box>
    )
}
