'use client';

import { Box, Input } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type Props = {
    searchValue: string | string[] | undefined
}

type Form = {
    searchValue : string | string[] | undefined
}

const SearchPageContent = ({ searchValue }: Props) => {
    const router = useRouter();
    const { register,handleSubmit, formState:{errors} } = useForm<Form>({
        defaultValues: {
            searchValue
        },
        mode:'onSubmit',
    });

    const onSubmit = (data:Form) => {
        router.replace(window.location.pathname+`?searchValue=${data.searchValue}`)
    }

    return (
        <Box component="form" w="90%" mx='auto' p={'md'} onSubmit={handleSubmit(onSubmit)}>
            <Input.Wrapper error={errors.searchValue?.message}>
                <Input {...register('searchValue', {
                    validate: (value) => {
                        if (!value || (typeof value === "string" && value.trim() === "")) {
                            return "검색어를 입력해주세요."; // 에러 메시지
                        }
                        return true; // 유효한 경우
                    }
                    })}
                    error={errors.searchValue?.message}
                    enterKeyHint="search"
                    inputMode="search"
                />
            </Input.Wrapper>
        </Box>
    )
}

export default SearchPageContent