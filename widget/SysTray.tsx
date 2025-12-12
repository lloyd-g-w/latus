import Tray from "gi://AstalTray"
import Gio from "gi://Gio"
import { Gtk } from "ags/gtk4"
import { For, With, createBinding, createState } from "ags"
import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { Space } from "./Utils"

const [moreVisible, setMoreVisible] = createState(false);

function SysTrayItem({ item }: { item: any }) {
    return (
        <menubutton
            class="systray-btn latus"
            $={(btn) => {
                const sync = () => {
                    const model =
                        item.menuModel ?? item["menu-model"] ?? item.menu_model ?? null
                    const group =
                        item.actionGroup ?? item["action-group"] ?? item.action_group ?? null

                    // clear old state
                    btn.insert_action_group("dbusmenu", null)
                    btn.set_popover(null)

                    if (group && group instanceof Gio.ActionGroup) {
                        btn.insert_action_group("dbusmenu", group)
                    }

                    if (model && model instanceof Gio.MenuModel) {
                        const pop = Gtk.PopoverMenu.new_from_model(model)
                        pop.insert_action_group("dbusmenu", group ?? null)
                        btn.set_popover(pop)
                        btn.sensitive = true
                    } else {
                        btn.sensitive = false
                    }
                }

                sync()
                item.connect("notify::menu-model", sync)
                item.connect("notify::action-group", sync)
            }}
        >
            <image class="systray-item latus" gicon={createBinding(item, "gicon")} />
        </menubutton>
    )
}

export default function SysTray() {
    const volume = createPoll("", 100, "./scripts/getvol.sh")
    const tray = Tray.get_default()
    const items = createBinding(tray, "items")

    return (
        <box class="systray latus">

            <revealer transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                revealChild={moreVisible} >
                <box class="systray latus" orientation={Gtk.Orientation.HORIZONTAL} spacing={0}>
                    <box class="systray latus" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
                        <For each={items}>{(item) => <SysTrayItem item={item} />}</For>
                    </box>
                    <Space />
                </box>
            </revealer >

            <box class="systray latus" orientation={Gtk.Orientation.HORIZONTAL} spacing={8} >
                <box class="latus">
                    <With value={moreVisible}>
                        {(vis) => {
                            return <button onClicked={() => {
                                setMoreVisible(!vis)
                            }}
                                class="systray-more-btn"
                                label={vis ? "" : ""} />
                        }}
                    </With>
                </box>

                <button class="latus" onClicked={
                    () => execAsync("swaync-client --toggle-panel").catch(e => { print(e) })
                } label="󰂚" />

                <button class="latus" onClicked={
                    () => execAsync("wlogout").catch(e => { print(e) })
                } label="" />

            </box >

        </box >
    )
}

