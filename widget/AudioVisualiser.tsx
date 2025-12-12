import AstalCava from "gi://AstalCava"
import { createState } from "ags"

const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "▉", "█"]
const BARS = 9

const shouldShow = (values: number[]) =>
    values.length > 0 && !values.every(v => v < 0.001)

export function AudioVisualiser() {
    const cava = AstalCava.get_default()!
    cava.set_bars(BARS)

    const [visuals, setVisuals] = createState("")

    cava.connect("notify::values", ({ values }) => {
        if (!shouldShow(values)) {
            setVisuals(
                "▁".repeat(BARS)
            )
            return
        }

        // setVisible(true)
        setVisuals(
            values
                .map(v => blocks[Math.min(Math.floor(v * blocks.length), blocks.length - 1)])
                .join(""),
        )
    })

    return (
        <box class="cava latus">
            <label class="cava-label latus" label={visuals} />
        </box>
    )
}

