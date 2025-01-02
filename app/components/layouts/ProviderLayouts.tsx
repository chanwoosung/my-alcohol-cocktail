import { MantineProvider } from "@mantine/core"
import { PropsWithChildren } from "react"

const ProviderLayout = ({children}:PropsWithChildren) => {
    return (
        <MantineProvider>
            {children}
        </MantineProvider>
    )
}

export default ProviderLayout