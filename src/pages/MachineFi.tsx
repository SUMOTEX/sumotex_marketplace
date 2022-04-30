import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { observer, useLocalStore } from 'mobx-react-lite';
import API from '../common/utils/API';
import marketplaceABI from '@/constants/abi/marketplace.json';
import erc721 from '@/constants/abi/erc721.json';
import { Center, Link, Box, Spinner, Button } from '@chakra-ui/react';
import { useStore } from '../store/index';
import { StringState, BooleanState } from '../store/standard/base';
import TokenState from '../store/lib/TokenState';
import { BigNumberInputState } from '../store/standard/BigNumberInputState';
import { eventBus } from '../lib/event';
import { BigNumberState } from '../store/standard/BigNumberState';
import Web3 from "web3";
import Modal from 'react-modal';
import moment from 'moment';
import _ from 'lodash';
import { BigNumber } from 'ethers';


const MachineFi = observer(() => {
  const { god, token, lang } = useStore();
  const [state, setState] = useState({
    name: '',
    currentMinted: 0
  });
  const [loading, setLoading] = useState(true);
  const [totalNFT, setTotalNFT] = useState(0)
  const [soldNFT, setSoldNFT] = useState(0)
  const [boughtNFT, setBoughtNFT] = useState(false)
  const [loadSpinner, setSpinner] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState(0)
  const [floorPrice, setFloorPrice] = useState(0)
  const [highestPrice, setHighestPrice] = useState(0)
  const [volume, setVolume] = useState(0)
  const [theModalNFT, setModalNFT] = useState({ image: '', name: '', edition: '', dividendAmount: '', price: '', itemId: '' })
  const [displayingNFT, setDisplayNFT] = useState([])
  const [allNFT, setAllNFT] = useState([])
  const newToken = new TokenState({
    abi: erc721,
    symbol: 'SUMOTEX',
    name: 'SUMOTEX',
    address: '0x9756E951dd76e933e34434Db4Ed38964951E588b',
    balance: new BigNumberState({})
  })
  const store = useLocalStore(() => ({
    amount: new BigNumberInputState({}),
    receiverAdderss: new StringState(),
    curToken: newToken,
    isOpenTokenList: new BooleanState(),
    get state() {
      if (!god.isConnect) {
        return { valid: true, msg: lang.t('connect.wallet'), msgApprove: '', connectWallet: true };
      }
      const valid = store.curToken && store.amount.value && store.receiverAdderss.value;
      store.curToken = newToken;
      return {
        valid,
        msg: true ? lang.t('connected') : lang.t('invalid.input'),
        msgApprove: true ? lang.t('connected') : lang.t('invalid.input')
      };
    },

  }));
  useEffect(() => {
    setBoughtNFT(false)
  }, [])
  useEffect(() => {
    eventBus.on('chain.switch', () => {

    });
    theInitialFunction();
  }, [boughtNFT]);

  const [modalIsOpen, setIsOpen] = React.useState(false);

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    //
  }
  function closeModal() {
    setIsOpen(false);
  }
  const setModalItems = (item, type) => {
    setIsOpen(true)
    setModalNFT(item)
  }
  const theInitialFunction = async () => {
    //console.log(god.currentChain.chainId,god.currentChain.Coin)
    let theAddress = await god.currentNetwork.execContract({
      address: '0x8b58c2225b92F3B3252B2c5860AC240dCE05172F',
      abi: marketplaceABI,
      method: "fetchMarketItems",
      params: []
    })
    if (theAddress instanceof Array) {
      var theArray = theAddress.filter(function (item) {
        return (item['tokenId']).toNumber() !== 0;
      })
      var theArray2 = theArray.filter(function (item) {
        return (item['sold']) != true;
      })
      var soldArray = theArray.filter(function (item) {
        return (item['sold']) == true;
      })
      setSoldNFT(soldArray.length)
      setTotalNFT(theArray2.length)
      filterNFTs(theArray2)
      var totalSoldVolume = 0
      soldArray.map((item, index) => {
        var theItem = (Web3.utils.fromWei(String(Web3.utils.toBN(item['price'])), 'ether'))
        totalSoldVolume += Number((theItem))
        //console.log(totalSoldVolume.toString())
      })
      setVolume(totalSoldVolume)
      var thefloorPrice = 0
      if (theArray2.length != 0) {
        thefloorPrice = Number(Web3.utils.fromWei(String(theArray2[0]['price']), 'ether'))
        theArray2.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (thefloorPrice >= theItem) {
            thefloorPrice = theItem
          }
        })
        setFloorPrice(thefloorPrice);
      }
      var theCeilingPrice = 0
      if (soldArray.length != 0) {
        theCeilingPrice = Number(Web3.utils.fromWei(String(soldArray[0]['price']), 'ether'))
        soldArray.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (theCeilingPrice <= theItem) {
            theCeilingPrice = theItem
          }
        })
        setHighestPrice(theCeilingPrice);
      }
    }
    setLoading(false)
  }

  const buyNFT = async (itemID, theValue) => {
    let totalGasLimit = String(250111);
    //0x8b58c2225b92F3B3252B2c5860AC240dCE05172F
    try {
      let theAddress = await god.currentNetwork.execContract({
        address: '0x8b58c2225b92F3B3252B2c5860AC240dCE05172F',
        abi: marketplaceABI,
        method: "createMarketSale",
        params: ['0x9756E951dd76e933e34434Db4Ed38964951E588b', String(itemID)],
        options: { value: String(theValue) + '0'.repeat(18), gasLimit: totalGasLimit }
      })
      setSpinner(true)
      let theReceipt = await theAddress.wait(); // to get the wait done
      if (theReceipt.status == 1) {
        setSpinner(false)
        setBoughtNFT(!boughtNFT)
      }
    } catch (error) {
      if (error.code == 4001) {
        toast.error(String(error.message))
      }
    }
  }

  const filterNFTs = async (array) => {
    array.map(async (item, index) => {
      var ownerAdd = (item['owner']).toString()
      var tokenID = (item['tokenId']).toNumber()
      var itemID = (item['itemId']).toNumber()
      var BNtotalCostWei = Web3.utils.fromWei((item['price']).toString(), 'ether')
      var thePrice = (BNtotalCostWei)
      var url = ('https://sumotex.mypinata.cloud/ipfs/Qme4K7ZKYaXTKSVX9Pwthauqu2P86wTvbBHtkdqmSPGo73/' + tokenID + '.json')
      API.get(url).then((response) => {
        //await sleep(800);
        var theItem = response.data
        var theImage = theItem.image.substring(theItem.image.lastIndexOf("/") + 1, theItem.image.length);
      }).catch(error => {
        toast.error(String(error))

      })
    });
    changeFilter(0)
    //setAllNFT([])
  }


  const changeFilter = (filterValue) => {
    if (filterValue === 0) {
      //lowest
      let gfg = _.orderBy(displayingNFT, ['price'], ['asc']);
      setDisplayNFT(gfg)
    }
    else if (filterValue === 1) {
      //highest
      let gfg = _.orderBy(displayingNFT, ['price'], ['desc']);
      setDisplayNFT(gfg)
    }
  }
  return (
    <div>
      {loading ? null : <div style={{ justifyItems: "center", margin: 10, width: '100%' }}>
        {totalNFT != 0 ? <div></div> : null}
        <Box style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: "wrap",
          flexDirection: 'row', minHeight: 20
        }}>
          <Toaster
            position="top-right"
            reverseOrder={false}
          />
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>MachineFi for sale: {totalNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>Sold NFT: {soldNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>Floor Price: {(floorPrice)} iotex</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>Highest Sold Price: {(highestPrice).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} iotex</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>Volume: {(volume).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} iotex</h4>
          </Box>
        </Box>
        <Box style={{display: 'flex',justifyContent:'center'}}>
          {allNFT.length !== 0 ? <div style={{
            borderRadius: 12,
            backgroundColor: 'black',
            color: 'white',
            alignContent: 'center',
            padding: 5,
            paddingLeft: 10,
            paddingRight: 10,
            margin: 5,
            fontSize: 13
          }}
            onClick={() => changeFilter(6)}
          >Sort Lowest Price</div> : null}
          {allNFT.length !== 0 ? <div style={{
            borderRadius: 12,
            backgroundColor: 'black',
            color: 'white',
            alignContent: 'center',
            padding: 5,
            paddingLeft: 10,
            paddingRight: 10,
            margin: 5,
            fontSize: 13
          }}
            onClick={() => changeFilter(7)}
          >Sort Highest Price</div> : null}
        </Box>
      </div>}
      <div >
        <div>
          {loading ? <Center>Loading</Center> : allNFT.length === 0 ? <div style={{
            padding: 5,
            textAlign: "center"
          }}>
            <Center style={{ display: 'flex', flexDirection: "row", margin: 20, flexWrap: "wrap", maxWidth: '100%' }}>
              <p>No NFT for SALE. Please come again.</p>
            </Center>
          </div> :
            <div
              style={{
                margin: 5,
                padding: 5,
                paddingLeft: 5,
                justifyContent: 'center',
                justifyItems: 'center',
                display: 'flex',
                flexWrap: "wrap",
                flexDirection: 'row',
                maxWidth: '100%'
              }}>
              <Modal isOpen={modalIsOpen} onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={{
                  content: {
                    // width: '80%',
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                  }
                }}
                centered>
                <Box m="5" borderWidth='3px' style={{ padding: 10, display: "flex", flexDirection: "column" }}>
                  <Box style={{
                    justifyContent: 'center',
                    justifyItems: 'center',
                    display: 'flex',
                    flexWrap: "wrap",
                    flexDirection: 'column',
                    maxWidth: '100%'
                  }}>
                    <h3 style={{ fontSize: 20, textAlign: 'center', fontWeight: 'bold', padding: 5 }}>{theModalNFT.name}</h3>
                    <img src={theModalNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={160} />
                    <p style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>ID: {theModalNFT.edition}</p>
                    <p style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', padding: 5 }}>APY: {theModalNFT.dividendAmount}%</p>
                  </Box>
                  <Box style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>Price {theModalNFT.price} IOTEX</p>
                    {boughtNFT ? <Link type="button" href={"https://display.sumotex.co"} >View it here</Link> :
                      <Button onClick={() => buyNFT(theModalNFT.itemId, theModalNFT.price)}
                        mt="5" bg="lightgreen"> {loadSpinner ? <Spinner /> : null} {'BUY NOW'}</Button>}
                  </Box>
                </Box>
              </Modal>
              {([...new Set(displayingNFT)]).map((item, index) => {
                return (
                  <div key={item.edition} style={{
                    minWidth: 300,
                    flexDirection: "row",
                    justifyContent: 'center',
                    justifyItems: 'center',
                    alignItems: 'center',
                    margin: 10,
                    padding: 10,
                    borderWidth: 0.5,
                    borderStyle: 'solid',
                    borderColor: "grey",
                    borderRadius: 6
                  }}>
                    <img src={item.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={220} />
                    <h3 style={{ fontSize: 18, marginTop: 15 }}>{item.name}</h3>
                    <p style={{ fontSize: 16, fontWeight: 'bold' }}>ID: {item.edition}</p>
                    <p style={{ fontSize: 18, fontWeight: 'bold' }}>APY: {item.dividendAmount}%</p>
                    <p style={{ fontSize: 15, marginTop: 5, fontWeight: 'bold' }}>Ranking: {item.nftStyle}</p>
                    <p style={{ fontSize: 15, marginTop: 5, fontWeight: 'bold' }}>Seller: {(item.ownerID).slice(-5)}</p>
                    <p style={{ fontSize: 16, marginTop: 15, fontWeight: 'bold', color: "green" }}>Price: {Number(item.price).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTEX</p>
                    {!god.currentNetwork.account ? <p>Connect your wallet to purchase.</p> : item.ownerID == god.currentNetwork.account ? null : <Box onClick={() => setModalItems(item, 1)} as='button' borderRadius='md' mt="3" bg='green' color='white' minWidth={110} px={4} h={8}>
                      <p style={{ fontSize: 16, fontWeight: 'bold' }}>BUY</p>
                    </Box>}
                    <div><p style={{ marginTop: 30, fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' }}>Rarity</p>
                      {item.attributes.map((item, index) => {
                        return (<div style={{ marginLeft: 10, fontSize: 14, padding: 2, flexDirection: 'row' }}>{item.trait_type}: {item.value.split('_')[0]} {item.value.split('_')[1]}({item.frequency})</div>)
                      })}
                    </div>
                  </div>
                )
              }
              )}
            </div>
          }
        </div>
      </div>
    </div >
  );
});

export default MachineFi;
