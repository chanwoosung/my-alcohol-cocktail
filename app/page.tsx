import { Flex, Image, Title } from "@mantine/core";
import NextImage from 'next/image';

export default function Home() {
  return (
    <Flex justify={'center'}>
      <Flex justify={'center'} direction={'column'}>
        <Image width={50} height={50} w={'50%'} component={NextImage} src={'/icon.webp'}mx={'auto'} alt="main_logo"/>
        <Title className="font-pixel" order={2} mx="auto">
          My Cocktail Book 
        </Title>
      </Flex>
    </Flex>
  );
}
