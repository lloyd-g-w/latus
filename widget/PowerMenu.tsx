import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

type Action = {
    label: string
    icon: string
    cmd: string | string[]
}

const actions: Action[] = [
    { label: "Lock", icon: "system-lock-screen-symbolic", cmd: ["loginctl", "lock-session"] },
    { label: "Suspend", icon: "media-playback-pause-symbolic", cmd: ["systemctl", "suspend"] },
    { label: "Log out", icon: "system-log-out-symbolic", cmd: ["niri", "msg", "action", "quit"] },
    { label: "Reboot", icon: "system-reboot-symbolic", cmd: ["systemctl", "reboot"] },
    { label: "Shutdown", icon: "system-shutdown-symbolic", cmd: ["systemctl", "poweroff"] },
]

export default function PowermenuPopover() {
    let pop: Gtk.Popover | null = null

    const run = (cmd: string | string[]) => {
        pop?.popdown()
        execAsync(cmd).catch((e) => console.error("[powermenu]", e))
    }

    return (
        <menubutton class="latus">
            {/* button content (what shows in the bar) */}
            <box spacing={8}>
                <image class="latus btn" iconName="system-shutdown-symbolic" />
            </box>

            {/* popover content */}
            <popover
                class="latus"
                $={(self) => (pop = self as Gtk.Popover)}
            >
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={6}
                    marginTop={10}
                    marginBottom={10}
                    marginStart={10}
                    marginEnd={10}
                >
                    {actions.map((a) => (
                        <button class="PowermenuItem" onClicked={() => run(a.cmd)}>
                            <box spacing={10}>
                                <image iconName={a.icon} />
                                <label xalign={0} label={a.label} />
                            </box>
                        </button>
                    ))}
                </box>
            </popover>
        </menubutton>
    )
}

