import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { With, type Accessor } from "ags"
import SysTray from "./SysTray"
import { AudioVisualiser } from "./AudioVisualiser"
import Workspaces from "./Workspaces"
import { Brackets, Space } from "./Utils"
import Stats from "./Stats"

function Left(props: { gdkmonitor: Gdk.Monitor }) {
  const time = createPoll("", 1000, "date '+%a %d %b %-I:%M:%S %p'")
  return <box $type="start" halign={Gtk.Align.START} >

    <menubutton class="latus">
      <box>
        <Brackets>
          <label label={time} class="date-time latus" />
        </Brackets>
      </box>
      <popover class="latus">
        <Gtk.Calendar />
      </popover>
    </menubutton>

    <Space />
    <Brackets>
      <AudioVisualiser />
    </Brackets>

  </box>
}

function Center(props: { gdkmonitor: Gdk.Monitor }) {
  const { gdkmonitor } = props;

  return <box class="latus" $type="center" halign={Gtk.Align.CENTER}>
    <Brackets>
      <Workspaces output={gdkmonitor.connector} />
    </Brackets>
  </box>
}

function Right(props: { gdkmonitor: Gdk.Monitor }) {
  return <box class="latus" $type="end" halign={Gtk.Align.END} >

    <Brackets>
      <Stats />
    </Brackets>

    <Space />
    <Brackets>
      <SysTray />
    </Brackets>

  </box>
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name="bar"
      class="Bar latus"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <Left gdkmonitor={gdkmonitor} />
        <Center gdkmonitor={gdkmonitor} />
        <Right gdkmonitor={gdkmonitor} />

      </centerbox>
    </window>
  )
}
