import { MantineProvider } from "@mantine/core"
import { PropsWithChildren } from "react"
import QueryClientProviderLayout from "./QueryClientProviderLayout"

const ProviderLayout = ({children}:PropsWithChildren) => {
    return (
        <QueryClientProviderLayout>
            <MantineProvider>
                {children}
            </MantineProvider>
        </QueryClientProviderLayout>
    )
}

export default ProviderLayout