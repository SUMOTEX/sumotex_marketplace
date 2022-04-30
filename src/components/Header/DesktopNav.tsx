import React from 'react';
import { Stack, BoxProps, Text, Button, Box, Img, Link as ChakraLink, chakra, useColorModeValue } from '@chakra-ui/react';
import { observer, useObserver, useLocalStore } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { helper } from '@/lib/helper';
import Jazzicon from '../Jazzicon';

export const DesktopNav = observer((props: BoxProps) => {
  const { god, lang } = useStore();

  const store = useLocalStore(() => ({
    showConnecter() {
      god.setShowConnecter(true);
    },

    showWalletInfo() {
      god.currentNetwork.walletInfo.visible = true;
    }
  }));

  const accountView = useObserver(() => {
    if (!god.currentNetwork.account) {
      return (
        <Button colorScheme="pink" onClick={store.showConnecter}>
          {lang.t('connect.wallet')}
        </Button>
      );
    }
    return (
      <Button pr="0" pl="2" bg={useColorModeValue('gray.100', 'dark.100')}>

        <Text mr="2" fontSize="sm">
          <chakra.span mr={1}>{Number(god.currentChain.Coin.balance.format).toFixed(1)}</chakra.span>
          <chakra.span>{god.currentChain.Coin.symbol}</chakra.span>
        </Text>
        <Button
          px={4}
          onClick={store.showWalletInfo}
          sx={{
            color: 'white',
            bgGradient: god.currentChain.info.theme?.bgGradient,
            _hover: { bgGradient: god.currentChain.info.theme?.bgGradient },
            _active: { bgGradient: god.currentChain.info.theme?.bgGradient }
          }}
        >
          <Text mr={1}>{helper.string.truncate(god.currentNetwork.account, 6, '...')}</Text>
          <Jazzicon diameter={14} address={god.currentNetwork.account} style={{ border: '2px solid #617aff', borderRadius: '50px', padding: '1px' }}></Jazzicon>
        </Button>
      </Button>
    );
  });
  return (
    <Stack direction={'row'} spacing={1} {...props}>
       <ChakraLink pt={2}textDecoration="underline" borderRadius='md' color='black' fontWeight={'bold'} px={2} href="/" key={"/"}>Marketplace</ChakraLink>
      <ChakraLink pt={2}textDecoration="underline" borderRadius='md' color='black' fontWeight={'bold'} px={2} href="/ListForSale.html" key={"/ListForSale"}>Sell My NFT</ChakraLink>
      <Button onClick={store.showConnecter} pl={1} borderRadius="40">
        <Img w={2} src={god.currentChain.logoUrl} />
        <Box ml={1}>{god.currentChain.name}</Box>
      </Button>
      {accountView}
    </Stack>
  );
});
