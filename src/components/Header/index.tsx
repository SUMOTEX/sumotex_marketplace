import React from 'react';
import {
  Box,
  Flex,
  Container,
  Stack,
  useDisclosure,
  IconButton,
  useColorModeValue,
  Icon,
  useColorMode,
  Heading,
  Alert,
  AlertIcon,
  Text,
  AlertDescription,
  CloseButton,
  Link as LinkC
} from '@chakra-ui/react';
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { IoMoon, IoSunny } from 'react-icons/io5';
import Link from 'next/link'
import { Logo } from '../Logo';
import { DesktopNav } from '@/components/Header/DesktopNav';
import { observer } from 'mobx-react-lite';
import { WalletInfo } from '../WalletInfo';
import { useWeb3React } from '@web3-react/core';
import { getErrorMessage } from '../../lib/web3-react';
import { Button, Avatar, Image } from '@chakra-ui/react';
import { useStore } from '../../store/index';
import { helper } from '@/lib/helper';
import { NoEthereumProviderError } from '@web3-react/injected-connector';

export const Header = observer(() => {
  const { isOpen: isMobileNavOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { error } = useWeb3React();
  const { lang } = useStore();
  return (
    <Box>
      <Flex
        as={'header'}
        minH={'60px'}
        boxShadow={'sm'}
        zIndex="999"
        justify={'center'}
        css={{
          backdropFilter: 'saturate(180%) blur(5px)',
          backgroundColor: useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')
        }}
      >
        <Container as={Flex} maxW={'7xl'} align={'center'}>
          {/* <Flex flex={{ base: 1, md: 'auto' }} ml={{ base: -2 }} display={{ base: 'flex', md: 'none' }}>
            <IconButton onClick={onToggle} icon={isMobileNavOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />} variant={'ghost'} size={'sm'} aria-label={'Toggle Navigation'} />
          </Flex> */}

          <Flex flex={{ base: 1, md: 'auto' }} justify={{ base: 'center', md: 'start' }}>
            <a href="https://sumotex.co">
              <Stack as={'a'} direction={'row'} alignItems={'center'} spacing={{ base: 2, sm: 4 }}>
                <Heading as={'h1'} fontSize={'xl'} display={{ base: 'none', md: 'block' }}>
                  SUMOTEX | Marketplace
                </Heading>
              </Stack>
            </a>
          </Flex>

          <Stack direction={'row'} align={'center'} spacing={2} flex={{ base: 1, md: 'auto' }} justify={'flex-end'}>
            <Flex display={{ base: 'flex', md: 'flex' }} ml={2}>
              <DesktopNav />
            </Flex>
          </Stack>
        </Container>
      </Flex>
      <Container maxW={'7xl'} size="">
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error instanceof NoEthereumProviderError ?
              <AlertDescription >
                <LinkC href={helper.env.isPc() ? 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn' : 'https://iopay.me'}>{getErrorMessage(error)}</LinkC>
              </AlertDescription> : <AlertDescription>
                {getErrorMessage(error)}
              </AlertDescription>}
            <CloseButton position="absolute" right="8px" top="8px" />
          </Alert>
        )}
      </Container>
      <WalletInfo />
    </Box>
  );
});
