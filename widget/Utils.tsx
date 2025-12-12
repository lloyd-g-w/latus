export function Brackets(props: { children?: any }) {
    return (
        <box class="latus">
            <label class="latus" label="[ " />
            {props.children}
            <label class="latus" label=" ]" />
        </box>
    )
}

export function Space() {
    return <label class="latus" label=" " />
}
