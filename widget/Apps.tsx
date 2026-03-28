import { Gtk } from "ags/gtk4"
import { execAsync, createSubprocess } from "ags/process"
import { For, type Accessor } from "ags"
import { Window, niriWindows, niriWorkspaces } from "./Globals"

const focusApp = (win: Window, self: any) => {
    const click = new Gtk.GestureClick();
    click.connect("pressed", () => {
        execAsync(["niri", "msg", "action", "focus-window", "--id", String(win.id)])
    });
    self.add_controller(click);
}


export default function Apps({ output }: { output: string }) {
    const apps = niriWindows.as((wins) => {
        // This read should work in practice; if your AGS build doesn't track it as a dependency,
        // you'll still at least see windows once workspaces is non-empty.
        const wsById = new Map(niriWorkspaces().map((ws) => [ws.id, ws.output ?? ""]))
        return wins.filter((w) => wsById.get(w.workspace_id ?? -1) === output)
    })

    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["apps-container"]} spacing={8}>
            <For each={apps}>
                {(win) => (
                    <box spacing={4}
                        cssClasses={win.is_focused ? ["app-btn", "active"] : ["app-btn"]}
                        tooltipText={win.title ?? ""}
                        $={(self) => focusApp(win, self)}
                    >
                        <image iconName={win.app_id ?? "application-x-executable"}
                        />
                        {/* <label */}
                        {/*     label={ */}
                        {/*         (win.title ?? "").length > 20 */}
                        {/*             ? (win.title ?? "").slice(0, 17) + "..." */}
                        {/*             : (win.title ?? "") */}
                        {/*     } */}
                        {/*     visible={win.is_focused} */}
                        {/* /> */}
                    </box>
                )}
            </For>
        </box>
    )
}

