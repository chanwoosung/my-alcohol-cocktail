'use client';

import { Box, Input } from "@mantine/core";

type Props = {
    queryText: string
}

const SearchPageContent = ({ queryText }: Props) => {
    console.log(queryText);
    return (
        <Box component="form">
            <Input />
        </Box>
    )
}

export default SearchPageContent