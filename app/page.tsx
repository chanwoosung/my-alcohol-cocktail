import { Button, Flex, Image, Title } from "@mantine/core";
import NextImage from 'next/image';
import Link from "next/link";

export default function Home() {
  return (
    <Flex justify={'center'}>
      <Flex justify={'center'} direction={'column'}>
        <Image width={50} height={50} w={'50%'} component={NextImage} src={'/icon.webp'}mx={'auto'} alt="main_logo"/>
        <Title className="font-pixel" order={2} mx="auto">
          My Cocktail Book 
        </Title>
        <Flex gap='lg'>
            <Button component={Link} href={'/alcohol-list'}>내 술 목록</Button>
            <Button component={Link} href={'/search'}>칵테일 재료로 찾기</Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
