import { Gtk } from "ags/gtk4"
import { For, With, createBinding, createState } from "ags"
import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { Space } from "./Utils"

const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    execAsync([
        "wpctl",
        "set-volume",
        "@DEFAULT_AUDIO_SINK@",
        `${clamped}%`,
    ]);
};

const openBtop = (self: any) => {
    const click = new Gtk.GestureClick();
    click.connect("pressed", () => {
        execAsync("kitty -e btop").catch(print);
    });
    self.add_controller(click);
}

export default function Stats() {
    const volume = createPoll("", 100, "./scripts/getvol.sh")

    // Poll CPU usage (updates every 2s)
    // Calculates: 100% - Idle%
    const cpu = createPoll("", 2000, "bash -c \"top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'\"")

    // Poll RAM usage (updates every 2s)
    const ram = createPoll("", 2000, "bash -c \"free | awk '/^Mem/ {printf \\\"%.0f\\\\n\\\", $3/$2 * 100}'\"")

    return (
        <box class="stats latus">
            <box class="stats latus" orientation={Gtk.Orientation.HORIZONTAL} spacing={8} >

                {/* --- CPU --- */}
                <box spacing={8}>
                    <label label="CPU:" />
                    <With value={cpu}>
                        {(val) => (
                            <label
                                class="latus btn"
                                label={`${Math.round(Number(val))}%`}
                                $={openBtop}
                            />
                        )}
                    </With>
                </box>

                <label label="|" />

                {/* --- MEMORY --- */}
                <box spacing={8}>
                    <label label="MEM:" />
                    <With value={ram}>
                        {(val) => (
                            <label
                                class="latus btn"
                                label={`${Math.round(Number(val))}%`}
                                $={openBtop} // Optional: Click to open task manager
                            />
                        )}
                    </With>
                </box>

                <label label="|" />

                {/* --- VOLUME --- */}
                <box spacing={8}>
                    <label label="VOL:" />
                    <With value={volume}>
                        {(vol) => {
                            let current = Math.round(parseInt(vol));
                            return (
                                <label
                                    class="latus vol-scroller"
                                    label={`${current}%`}
                                    $={(self) => {
                                        // 1. Scroll Controller
                                        const scroll = new Gtk.EventControllerScroll({
                                            flags: Gtk.EventControllerScrollFlags.VERTICAL,
                                        });

                                        scroll.connect("scroll", (_, __, dy) => {
                                            if (dy < 0) setVolume(current + 5);
                                            else if (dy > 0) setVolume(current - 5);
                                        });
                                        self.add_controller(scroll);

                                        // 2. Click Controller
                                        const click = new Gtk.GestureClick();
                                        click.connect("pressed", () => {
                                            execAsync("pavucontrol").catch(print);
                                        });
                                        self.add_controller(click);
                                    }}
                                />
                            );
                        }}
                    </With>
                </box>

            </box>
        </box>
    )
}
