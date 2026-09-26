import { Gtk } from "ags/gtk4"
import { For } from "ags"

import { Workspace, workspaces as allWorkspaces, focusWorkspace } from "./Globals"


export default function Workspaces({ output }: { output: string }) {
    const workspaces = allWorkspaces.as<Workspace[]>(wsList =>
        wsList.filter(ws => ws.output === output)
    )

    return (
        <box orientation={Gtk.Orientation.HORIZONTAL}>
            <For each={workspaces}>
                {(ws, i) => (
                    <button
                        class={ws.is_active ? "workspace-btn latus active" : "workspace-btn latus"}
                        onClicked={() =>
                            focusWorkspace(ws).catch((e) => console.error("[workspaces]", e))
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
