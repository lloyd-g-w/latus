import { Gtk } from "ags/gtk4"
import { For } from "ags"
import { Window, windows, focusWindow } from "./Globals"

const focusApp = (win: Window, self: any) => {
    const click = new Gtk.GestureClick();
    click.connect("pressed", () => {
        focusWindow(win).catch((e) => console.error("[apps]", e))
    });
    self.add_controller(click);
}


export default function Apps({ output }: { output: string }) {
    const apps = windows.as((wins) => wins.filter((w) => w.output === output))

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
