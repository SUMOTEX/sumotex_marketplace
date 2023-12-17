import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { observer, useLocalStore } from 'mobx-react-lite';
import API from '../common/utils/API';
import marketplaceABI from '@/constants/abi/marketplace.json';
import machineFiABI from '@/constants/abi/machineFi.json';
import iotexDomainABI from '@/constants/abi/iotexDomain.json';
import KnowToEarnABI from '@/constants/abi/knowToEarn.json';
import erc721 from '@/constants/abi/erc721.json';
import {
  Center, Link, Box, Spinner, Button, Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { useStore } from '../store/index';
import { StringState, BooleanState } from '../store/standard/base';
import TokenState from '../store/lib/TokenState';
import { BigNumberInputState } from '../store/standard/BigNumberInputState';
import { eventBus } from '../lib/event';
import { BigNumberState } from '../store/standard/BigNumberState';
import Web3 from "web3";
import Modal from 'react-modal';
import moment from 'moment';
import _, { values } from 'lodash';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Lazyload from "react-lazyload";

const Home = observer(() => {
  const { god, token, lang } = useStore();
  const [loading, setLoading] = useState(true);
  //SUMOTEX SUMMARY
  const [totalNFT, setTotalNFT] = useState(0);
  const [soldNFT, setSoldNFT] = useState(0);
  const [floorPrice, setFloorPrice] = useState(0);
  const [highestPrice, setHighestPrice] = useState(0);
  const [volume, setVolume] = useState(0);
  //XSUMO SUMMARY
  const [xtotalNFT, setXTotalNFT] = useState(0);
  const [xsoldNFT, setXSoldNFT] = useState(0);
  const [xfloorPrice, setXFloorPrice] = useState(0);
  const [xhighestPrice, setXHighestPrice] = useState(0);
  const [xvolume, setXVolume] = useState(0);
  //MACHINEFI SUMMARY
  const [mtotalNFT, setMTotalNFT] = useState(0);
  const [msoldNFT, setMSoldNFT] = useState(0);
  const [mfloorPrice, setMFloorPrice] = useState(0);
  const [mhighestPrice, setMHighestPrice] = useState(0);
  const [mvolume, setMVolume] = useState(0);
  //IOTEXDOMAIN SUMMARY
  const [dtotalNFT, setdTotalNFT] = useState(0);
  const [dsoldNFT, setdSoldNFT] = useState(0);
  const [dfloorPrice, setdFloorPrice] = useState(0);
  const [dhighestPrice, setdHighestPrice] = useState(0);
  const [dvolume, setdVolume] = useState(0);
  //KnowNFT Summary
  const [ktotalNFT, setkTotalNFT] = useState(0);
  const [ksoldNFT, setkSoldNFT] = useState(0);
  const [kfloorPrice, setkFloorPrice] = useState(0);
  const [khighestPrice, setkHighestPrice] = useState(0);
  const [kvolume, setkVolume] = useState(0);

  const [xsumo, setXSumoNFT] = useState([]);
  const [machineFi, setMachineFiNFT] = useState([]);
  const [iotexDomain, setIotexDomainNFT] = useState([]);
  const [knowToEarn, setKnowNFT] = useState([]);
  const [boughtNFT, setBoughtNFT] = useState(false);
  const [loadSpinner, setSpinner] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [theModalNFT, setModalNFT] = useState({ image: '', name: '', edition: '', dividendAmount: '', price: '', itemId: '' });
  const [machineFiNFT, setMachineFiModal] = useState({ id: '', image: '', name: '', itemId: '', price: '' });
  const [iotexDomainNFT, setIotexDomainModal] = useState({ id: '', image: '', name: '', itemId: '', price: '' })
  const [knowNFT, setKnowNFTModal] = useState({ id: '', image: '', name: '', itemId: '', price: '' })
  const [xsumoNFT, setXSumoNFTModal] = useState({ id: '', image: '', name: '', itemId: '', price: '' })

  const [displayingNFT, setDisplayNFT] = useState([]);
  const [allNFT, setAllNFT] = useState([]);
  const [emperor, setEmperor] = useState([]);
  const [king, setKing] = useState([]);
  const [knights, setKnights] = useState([]);
  const [soldier, setSoldier] = useState([]);
  const [minion, setMinion] = useState([]);
  const [giga, setGiga] = useState([]);
  const [xemperor, setXEmperor] = useState([]);
  const [xking, setXKing] = useState([]);
  const [xknights, setXKnights] = useState([]);
  const [xsoldier, setXSoldier] = useState([]);
  const [xminion, setXMinion] = useState([]);
  //type of NFT
  //0 - SUMO
  //1 - MachinFI
  const [selectedNFT, setSelectedNFT] = useState(0);
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
    const loadFunctionInAsync = () => {
      theInitialFunction();
      //knowNFTFilter();
      // machineFiFilter();
      // iotexDomainFilter();

    }
    loadFunctionInAsync();

    //getPricing();
  }, [boughtNFT]);

  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalIsOpen2, setIsOpen2] = useState(false);
  const [modalIsOpen3, setIsOpen3] = useState(false);
  const [modalIsOpen4, setIsOpen4] = useState(false);
  const [modalIsOpen5, setIsOpen5] = useState(false);
  function afterOpenModal() {
  }
  function closeModal() {
    setIsOpen(false);
  }
  const setModalItems = (item, type) => {
    setIsOpen(true)
    setModalNFT(item)
  }
  function closeModal2() {
    setIsOpen2(false);
  }
  const setModalItems2 = (item, type) => {
    setIsOpen2(true)
    setMachineFiModal(item)
  }
  function closeModal3() {
    setIsOpen3(false);
  }
  const setModalItems3 = (item, type) => {
    setIsOpen3(true)
    setIotexDomainModal(item)

  }
  function closeModal4() {
    setIsOpen4(false);
  }
  const setModalItems4 = (item, type) => {
    setIsOpen4(true)
    setKnowNFTModal(item)
  }
  function closeModal5() {
    setIsOpen5(false);
  }
  const setModalItems5 = (item, type) => {
    setIsOpen5(true)
    setXSumoNFTModal(item)
  }
  const theInitialFunction = async () => {
    //console.log(god.currentChain.chainId,god.currentChain.Coin)
    var theArray = []
    //var theAddress2=[]
    var untryArray = []
    for (let i = 1; i < 7000; i++) {
      theArray.push(i)
    }
    // const responses = await Promise.allSettled(
    //   theArray.map(async id => {
    //     let theAddress1 = await god.currentNetwork.execContract({
    //       address:'0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee',
    //       //address: '0x8b58c2225b92F3B3252B2c5860AC240dCE05172F',
    //       abi: marketplaceABI,
    //       method: "fetchMarketItem",
    //       params: [id]
    //     })
    //     theAddress2.push(theAddress1)
    //     untryArray.push(id)
    //   })
    // )
    //0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee
    let theAddress2 = await god.currentNetwork.execContract({
      address: '0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee',
      abi: marketplaceABI,
      method: "fetchMarketItems",
      params: []
    })
    xsumoFilter(theAddress2);
    knowNFTFilter(theAddress2);
    machineFiFilter(theAddress2);
    iotexDomainFilter(theAddress2);


    if (theAddress2 instanceof Array) {
      var theArray = theAddress2.filter(function (item) {
        return (item['nftContract']) == '0x9756E951dd76e933e34434Db4Ed38964951E588b';
      })
      var theArray2 = theArray.filter(function (item) {
        return (item['sold']) != true;
      })
      var theArray3 = theArray2.filter(function (item) {
        return (item['tokenId']).toNumber() !== 0;

      })
      var theArray4 = _.uniqBy(theArray3, 'tokenId')
      var theArray4 = _.uniqBy(theArray4, 'itemId')
      var soldArray = theAddress2.filter(function (item) {
        return (item['sold']) == true;
      })
      setSoldNFT(soldArray.length + 927) //SOLD on OLD contract = 571
      setTotalNFT(theArray4.length)
      filterNFTs(theArray4)
      setLoading(false)
      var totalSoldVolume = 1557921
      soldArray.map((item, index) => {
        var theItem = (Web3.utils.fromWei(String(Web3.utils.toBN(item['price'])), 'ether'))
        totalSoldVolume += Number((theItem))
        //console.log(totalSoldVolume.toString())
      })
      setVolume(totalSoldVolume)
      var thefloorPrice = 0
      if (theArray4.length != 0) {
        thefloorPrice = Number(Web3.utils.fromWei(String(theArray4[0]['price']), 'ether'))
        theArray4.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (thefloorPrice >= theItem) {
            thefloorPrice = theItem
          }
        })
        setFloorPrice(thefloorPrice);
      }
      var theCeilingPrice = 14500
      if (soldArray.length != 0) {
        theCeilingPrice = Number(Web3.utils.fromWei(String(soldArray[0]['price']), 'ether'))
        soldArray.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (theCeilingPrice <= theItem) {
            theCeilingPrice = theItem
          }
        })
        setHighestPrice(theCeilingPrice);
      } else {
        setHighestPrice(theCeilingPrice);
      }
    }
  }
  const xsumoFilter = async (theAddress) => {
    if (theAddress instanceof Array) {
      var theArray = theAddress.filter(function (item) {
        return (item['nftContract']) == "0x7D150D3eb3aD7aB752dF259c94A8aB98d700FC00"
      })

      var theArray2 = theArray.filter(function (item) {
        return (item['tokenId']).toNumber() !== 0;

      })
      var theArray3 = theArray2.filter(function (item) {
        return (item['sold']) == false;
      })

      //summary section for XSUMO
      var soldArray = theArray2.filter(function (item) {
        return (item['sold']) == true;
      })
      var totalSoldVolume = 0 //356,685 IOTX
      soldArray.map((item, index) => {
        var theItem = (Web3.utils.fromWei(String(Web3.utils.toBN(item['price'])), 'ether'))
        totalSoldVolume += Number((theItem))
        //console.log(totalSoldVolume.toString())
      })
      //getFloorPrice
      var thefloorPrice = 0
      if (theArray3.length != 0) {
        thefloorPrice = Number(Web3.utils.fromWei(String(theArray3[0]['price']), 'ether'))
        theArray3.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (thefloorPrice >= theItem) {
            thefloorPrice = theItem
          }
        })
      }
      //getCeilingPrice
      var theCeilingPrice = 0
      if (soldArray.length != 0) {
        theCeilingPrice = Number(Web3.utils.fromWei(String(soldArray[0]['price']), 'ether'))
        soldArray.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (theCeilingPrice <= theItem) {
            theCeilingPrice = theItem
          }
        })
      }
      setXTotalNFT(theArray3.length)
      setXVolume(totalSoldVolume); //356,685 IOTX
      setXFloorPrice(thefloorPrice);
      setXHighestPrice(theCeilingPrice);
      setXSoldNFT(soldArray.length); //268

      theArray3.map(async (item, index) => {
        var ownerAdd = (item['owner']).toString()
        var theItemID = item['tokenId'].toNumber()
        var itemID = (item['itemId']).toNumber()
        var BNtotalCostWei = Web3.utils.fromWei((item['price']).toString(), 'ether')
        var thePrice = (BNtotalCostWei)
        let details = await god.currentNetwork.execContract(
          {
            address: '0x7D150D3eb3aD7aB752dF259c94A8aB98d700FC00',
            abi: erc721,
            method: 'tokenURI',
            params: [theItemID]
          })
        if (theItemID <= 10) {
          //@ts-ignore
          let theItem = details.replace("ipfs://", "https://sumotex.mypinata.cloud/ipfs/")
          API.get(theItem).then(res => {
            var theItemsNFT = res.data
            let theImage = (theItemsNFT['image']).replace("ipfs://", "https://sumotex.mypinata.cloud/ipfs/")
            setXSumoNFT(prevState => ([
              ...prevState, {
                id: theItemID,
                rewards: '80',
                ownerID: ownerAdd,
                itemId: itemID,
                dividendAmount: '25',
                name: theItemsNFT['name'],
                price: Number(thePrice),
                image: theImage
              }]))
              setGiga(prevState => ([
                ...prevState,
                {
                  id: theItemID,
                  rewards: '80',
                  ownerID: ownerAdd,
                  itemId: itemID,
                  dividendAmount: '25',
                  name: theItemsNFT['name'],
                  price: Number(thePrice),
                  image: theImage
                }
              ]))
          })
        } else {
          //@ts-ignore
          let theItem = details.replace("ipfs://", "https://sumotex.mypinata.cloud/ipfs/")
          API.get(theItem).then(res => {
            var theItemsNFT = res.data
            let theImage = (theItemsNFT['image']).replace("ipfs://", "https://sumotex.mypinata.cloud/ipfs/")
            var rarity = calculateXSUMORarity(theItemsNFT.attributes, 10000)
            var theDividend = (Number(theItemID) <= 10 ? 80 : rarity.dividend == 25 ? 50 : rarity.dividend == 15 ? 6 : rarity.dividend == 12 ? 4 : rarity.dividend == 7 ? 2 : 1)
            setXSumoNFT(prevState => ([
              ...prevState, {
                id: theItemID,
                rewards: theDividend,
                ownerID: ownerAdd,
                itemId: itemID,
                dividendAmount: rarity.dividend,
                name: theItemsNFT['name'],
                price: Number(thePrice),
                image: theImage
              }]))
            if (rarity.dividend === 25 && theItemID >= 11) {
              setXEmperor(prevState => ([
                ...prevState,
                {
                  id: theItemID,
                  rewards: theDividend,
                  ownerID: ownerAdd,
                  itemId: itemID,
                  dividendAmount: rarity.dividend,
                  name: theItemsNFT['name'],
                  price: Number(thePrice),
                  image: theImage
                }
              ]))
            }
            if (rarity.dividend === 15) {
              setXKing(prevState => ([
                ...prevState,
                {
                  id: theItemID,
                  rewards: theDividend,
                  ownerID: ownerAdd,
                  itemId: itemID,
                  dividendAmount: rarity.dividend,
                  name: theItemsNFT['name'],
                  price: Number(thePrice),
                  image: theImage
                }
              ]))
            }
            if (rarity.dividend === 12) {
              setXKnights(prevState => ([
                ...prevState,
                {
                  id: theItemID,
                  rewards: theDividend,
                  ownerID: ownerAdd,
                  itemId: itemID,
                  dividendAmount: rarity.dividend,
                  name: theItemsNFT['name'],
                  price: Number(thePrice),
                  image: theImage
                }
              ]))
            }
            if (rarity.dividend === 7) {
              setXSoldier(prevState => ([
                ...prevState,
                {
                  id: theItemID,
                  rewards: theDividend,
                  ownerID: ownerAdd,
                  itemId: itemID,
                  dividendAmount: rarity.dividend,
                  name: theItemsNFT['name'],
                  price: Number(thePrice),
                  image: theImage
                }
              ]))
            }
            if (rarity.dividend === 1) {
              setXMinion(prevState => ([
                ...prevState,
                {
                  id: theItemID,
                  rewards: theDividend,
                  ownerID: ownerAdd,
                  itemId: itemID,
                  dividendAmount: rarity.dividend,
                  name: theItemsNFT['name'],
                  price: Number(thePrice),
                  image: theImage
                }
              ]))
            }
          })
        }

      })

    }

  }

  const machineFiFilter = async (theAddress) => {
    if (theAddress instanceof Array) {
      var theArray = theAddress.filter(function (item) {
        return (item['nftContract']) == "0x0c5AB026d74C451376A4798342a685a0e99a5bEe"
      })

      var theArray2 = theArray.filter(function (item) {
        return (item['tokenId']).toNumber() !== 0;

      })
      var theArray3 = theArray2.filter(function (item) {
        return (item['sold']) == false;
      })

      //summary section for machineFi
      var soldArray = theArray2.filter(function (item) {
        return (item['sold']) == true;
      })
      var totalSoldVolume = 508194 //356,685 IOTX
      soldArray.map((item, index) => {
        var theItem = (Web3.utils.fromWei(String(Web3.utils.toBN(item['price'])), 'ether'))
        totalSoldVolume += Number((theItem))
        //console.log(totalSoldVolume.toString())
      })
      //getFloorPrice
      var thefloorPrice = 0
      if (theArray3.length != 0) {
        thefloorPrice = Number(Web3.utils.fromWei(String(theArray3[0]['price']), 'ether'))
        theArray3.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (thefloorPrice >= theItem) {
            thefloorPrice = theItem
          }
        })
      }
      //getCeilingPrice
      var theCeilingPrice = 3000
      if (soldArray.length != 0) {
        theCeilingPrice = Number(Web3.utils.fromWei(String(soldArray[0]['price']), 'ether'))
        soldArray.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (theCeilingPrice <= theItem) {
            theCeilingPrice = theItem
          }
        })
      }
      setMTotalNFT(theArray3.length)
      setMVolume(totalSoldVolume); //356,685 IOTX
      setMFloorPrice(thefloorPrice);
      setMHighestPrice(theCeilingPrice);
      setMSoldNFT(soldArray.length + 350); //268

      theArray3.map(async (item, index) => {
        var ownerAdd = (item['owner']).toString()
        var theItemID = item['tokenId'].toNumber()
        var itemID = (item['itemId']).toNumber()
        var BNtotalCostWei = Web3.utils.fromWei((item['price']).toString(), 'ether')
        var thePrice = (BNtotalCostWei)
        let details = await god.currentNetwork.execContract(
          {
            address: '0x0c5AB026d74C451376A4798342a685a0e99a5bEe',
            abi: machineFiABI,
            method: 'tokenURI',
            params: [theItemID]
          })
        let itemDetails = String(details)
        let theItemsNFT = JSON.parse(itemDetails)
        setMachineFiNFT(prevState => ([
          ...prevState, {
            id: theItemID,
            ownerID: ownerAdd,
            itemId: itemID,
            name: theItemsNFT['name'],
            price: Number(thePrice),
            image: theItemsNFT['image']
          }]))
      })

    }

  }
  const iotexDomainFilter = async (theAddress) => {
    if (theAddress instanceof Array) {
      var theArray = theAddress.filter(function (item) {
        return (item['nftContract']) == "0x4608eF714C8047771054757409c1A451CEf8d69f"
      })
      var theArray2 = theArray.filter(function (item) {
        return ((item['tokenId'])) !== 0;
      })
      var theArray3 = theArray2.filter(function (item) {
        return (item['sold']) == false;
      })
      //summary section for iotexDomain
      var soldArray = theArray2.filter(function (item) {
        return (item['sold']) == true;
      })
      var totalSoldVolume = 15019
      soldArray.map((item, index) => {
        var theItem = (Web3.utils.fromWei(String(Web3.utils.toBN(item['price'])), 'ether'))
        totalSoldVolume += Number((theItem))
        //console.log(totalSoldVolume.toString())
      })
      //getFloorPrice
      var thefloorPrice = 0
      if (theArray3.length != 0) {
        thefloorPrice = Number(Web3.utils.fromWei(String(theArray3[0]['price']), 'ether'))
        theArray3.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (thefloorPrice >= theItem) {
            thefloorPrice = theItem
          }
        })
      }
      //getCeilingPrice
      var theCeilingPrice = 5000
      if (soldArray.length != 0) {
        theCeilingPrice = Number(Web3.utils.fromWei(String(soldArray[0]['price']), 'ether'))
        soldArray.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (theCeilingPrice <= theItem) {
            theCeilingPrice = theItem
          }
        })
      }
      setdTotalNFT(theArray3.length)
      setdVolume(totalSoldVolume); //15019
      setdFloorPrice(thefloorPrice);
      setdHighestPrice(theCeilingPrice); //5000
      setdSoldNFT(soldArray.length + 15); //13

      theArray3.map(async (item, index) => {
        var ownerAdd = (item['owner']).toString()
        var theItemID = String(item['tokenId'])
        var itemID = (item['itemId']).toNumber()
        var BNtotalCostWei = Web3.utils.fromWei((item['price']).toString(), 'ether')
        var thePrice = (BNtotalCostWei)
        let details = await god.currentNetwork.execContract(
          {
            address: '0x4608eF714C8047771054757409c1A451CEf8d69f',
            abi: iotexDomainABI,
            method: 'tokenURI',
            params: [theItemID]
          })
        //@ts-ignore
        API.get(details).then(res => {
          var theNFT = res.data
          setIotexDomainNFT(prevState => ([
            ...prevState, {
              id: theItemID,
              ownerID: ownerAdd,
              itemId: itemID,
              name: theNFT['name'],
              price: Number(thePrice),
              image: theNFT['image']
            }]))
        })
      })
    }

  }
  const knowNFTFilter = async (theAddress) => {
    // let theAddress = await god.currentNetwork.execContract({
    //   address: '0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee',
    //   abi: marketplaceABI,
    //   method: "fetchMarketItems",
    //   params: []
    // })
    if (theAddress instanceof Array) {
      var theArray = theAddress.filter(function (item) {
        return (item['nftContract']) == "0xf129A758650A340958AEc74afc2E8D1E52180290"

      })
      var theArray2 = theArray.filter(function (item) {
        return ((item['tokenId'])) !== 0;
      })
      var theArray3 = theArray2.filter(function (item) {
        return (item['sold']) == false;
      })
      //summary section for iotexDomain
      var soldArray = theArray2.filter(function (item) {
        return (item['sold']) == true;
      })
      var totalSoldVolume = 109952
      soldArray.map((item, index) => {
        var theItem = (Web3.utils.fromWei(String(Web3.utils.toBN(item['price'])), 'ether'))
        totalSoldVolume += Number((theItem))
        //console.log(totalSoldVolume.toString())
      })
      //getFloorPrice
      var thefloorPrice = 0
      if (theArray3.length != 0) {
        thefloorPrice = Number(Web3.utils.fromWei(String(theArray3[0]['price']), 'ether'))
        theArray3.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (thefloorPrice >= theItem) {
            thefloorPrice = theItem
          }
        })
      }
      //getCeilingPrice
      var theCeilingPrice = 8888
      if (soldArray.length != 0) {
        theCeilingPrice = Number(Web3.utils.fromWei(String(soldArray[0]['price']), 'ether'))
        soldArray.map((item, index) => {
          var theItem = Number(Web3.utils.fromWei(String((item['price'])), 'ether'))
          if (theCeilingPrice <= theItem) {
            theCeilingPrice = theItem
          }
        })
      }
      setkTotalNFT(theArray3.length)
      setkVolume(totalSoldVolume); //93,886 IOTX
      setkFloorPrice(thefloorPrice);
      setkHighestPrice(theCeilingPrice); //8,888 IOTX
      setkSoldNFT(soldArray.length + 95); //82

      theArray3.map(async (item, index) => {
        var ownerAdd = (item['owner']).toString()
        var theItemID = String(item['tokenId'])
        var itemID = (item['itemId']).toNumber()
        var BNtotalCostWei = Web3.utils.fromWei((item['price']).toString(), 'ether')
        var thePrice = (BNtotalCostWei)
        let details = await god.currentNetwork.execContract(
          {
            address: '0xf129A758650A340958AEc74afc2E8D1E52180290',
            abi: KnowToEarnABI,
            method: 'tokenURI',
            params: [theItemID]
          })
        //@ts-ignore
        API.get(details).then(res => {
          //var theNFT = JSON.parse(String(res.data))
          let theRemovedString = (res.data).trim().replace(/("|{|}\r\n|\n|\r)/gm, "");
          let theVariable = (theRemovedString.split(','))
          let name = (theVariable[0].split(':')[1])
          let image = (theVariable[2].split(':').slice(1).join(':'))
          setKnowNFT(prevState => ([
            ...prevState, {
              id: theItemID,
              ownerID: ownerAdd,
              itemId: itemID,
              name: name,
              price: Number(thePrice),
              image: image
            }]))
        })

      })
    }

  }
  const buyXSUMONFT = async (itemID, theValue) => {
    let totalGasLimit = String(250111);
    setSpinner(true)
    //0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee
    try {
      let theAddress = await god.currentNetwork.execContract({
        address: '0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee',
        abi: marketplaceABI,
        method: "createMarketSale",
        params: ['0x7d150d3eb3ad7ab752df259c94a8ab98d700fc00', String(itemID)],
        options: { value: String(theValue) + '0'.repeat(18), gasLimit: totalGasLimit }
      })

      let theReceipt = await theAddress.wait(); // to get the wait done
      if (theReceipt.status == 1) {
        setSpinner(false)
        setBoughtNFT(!boughtNFT)
        toast.success(String('Succesfully Purchased' + theReceipt.transactionHash))
      }
    } catch (error) {
      if (error.code == 4001) {
        toast.error(String(error.message))
      }
    }
  }
  const buyNFT = async (itemID, theValue) => {
    let totalGasLimit = String(250111);
    setSpinner(true)
    //0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee
    try {
      let theAddress = await god.currentNetwork.execContract({
        address: '0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee',
        abi: marketplaceABI,
        method: "createMarketSale",
        params: ['0x9756E951dd76e933e34434Db4Ed38964951E588b', String(itemID)],
        options: { value: String(theValue) + '0'.repeat(18), gasLimit: totalGasLimit }
      })

      let theReceipt = await theAddress.wait(); // to get the wait done
      if (theReceipt.status == 1) {
        setSpinner(false)
        setBoughtNFT(!boughtNFT)
        toast.success(String('Succesfully Purchased' + theReceipt.transactionHash))
      }
    } catch (error) {
      if (error.code == 4001) {
        toast.error(String(error.message))
      }
    }
  }
  const buyMachineFi = async (itemID, theValue) => {
    let totalGasLimit = String(250111);
    setSpinner(true)
    //0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee
    try {
      let theAddress = await god.currentNetwork.execContract({
        address: '0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee',
        abi: marketplaceABI,
        method: "createMarketSale",
        params: ['0x0c5AB026d74C451376A4798342a685a0e99a5bEe', String(itemID)],
        options: { value: String(theValue) + '0'.repeat(18), gasLimit: totalGasLimit }
      })

      let theReceipt = await theAddress.wait(); // to get the wait done
      if (theReceipt.status == 1) {
        setSpinner(false)
        setBoughtNFT(!boughtNFT)
        toast.success(String('Succesfully Purchased' + theReceipt.transactionHash))
      }
    } catch (error) {
      if (error.code == 4001) {
        setSpinner(false)
        toast.error(String(error.message))
      }
    }
  }
  const buyIotexDomain = async (itemID, theValue) => {
    let totalGasLimit = String(250111);
    setSpinner(true)
    //0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee
    try {
      let theAddress = await god.currentNetwork.execContract({
        address: '0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee',
        abi: marketplaceABI,
        method: "createMarketSale",
        params: ['0x4608eF714C8047771054757409c1A451CEf8d69f', String(itemID)],
        options: { value: String(theValue) + '0'.repeat(18), gasLimit: totalGasLimit }
      })

      let theReceipt = await theAddress.wait(); // to get the wait done
      if (theReceipt.status == 1) {
        setSpinner(false)
        setBoughtNFT(!boughtNFT)
        toast.success(String('Succesfully Purchased' + theReceipt.transactionHash))
      }
    } catch (error) {
      if (error.code == 4001) {
        setSpinner(false)
        toast.error(String(error.message))
      }
    }
  }
  const buyKnowNFT = async (itemID, theValue) => {
    let totalGasLimit = String(250111);
    setSpinner(true)
    //0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee
    try {
      let theAddress = await god.currentNetwork.execContract({
        address: '0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee',
        abi: marketplaceABI,
        method: "createMarketSale",
        params: ['0xf129A758650A340958AEc74afc2E8D1E52180290', String(itemID)],
        options: { value: String(theValue) + '0'.repeat(18), gasLimit: totalGasLimit }
      })

      let theReceipt = await theAddress.wait(); // to get the wait done
      if (theReceipt.status == 1) {
        setSpinner(false)
        setBoughtNFT(!boughtNFT)
        toast.success(String('Succesfully Purchased' + theReceipt.transactionHash))
      }
    } catch (error) {
      if (error.code == 4001) {
        setSpinner(false)
        toast.error(String(error.message))
      }
    }
  }


  const filterNFTs = async (array) => {
    let promises = []
    array.map(async (item, index) => {
      promises.push(sumoFilter(item))
    })
    return Promise.all(promises).then(values => {
      //console.log(values)
    })
  }
  const sumoFilter = (item) => {
    return new Promise((resolve, reject) => {
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
        var stringImage = 'https://sumotex.mypinata.cloud/ipfs/QmXhVqBXvEVr9Ev1E6GyiTDUC78CcMsZx1FVZq1KieQu85/' + theImage
        var theDate = new Date(theItem.date).toLocaleString() + ''
        var rarity = calculateRarity(theItem.attributes, 100000)
        if (rarity.dividend === 25) {
          setEmperor(prevState => ([
            ...prevState,
            {
              name: theItem.name,
              price: Number(thePrice),
              rewards: '50',
              dna: theItem.dna,
              ownerID: ownerAdd,
              itemId: itemID,
              edition: theItem.edition,
              image: stringImage,
              attributes: theItem.attributes,
              dividendAmount: rarity.dividend,
              nftStyle: rarity.type,
              rankingPercentile: (Number(rarity.ranking)),
              mintedDate: theDate
            }
          ]))
        }
        if (rarity.dividend === 15) {
          setKing(prevState => ([
            ...prevState,
            {
              name: theItem.name,
              price: Number(thePrice),
              rewards: '6',
              dna: theItem.dna,
              ownerID: ownerAdd,
              itemId: itemID,
              edition: theItem.edition,
              image: stringImage,
              attributes: theItem.attributes,
              dividendAmount: rarity.dividend,
              nftStyle: rarity.type,
              rankingPercentile: (Number(rarity.ranking)),
              mintedDate: theDate
            }
          ]))
        }
        if (rarity.dividend === 12) {
          setKnights(prevState => ([
            ...prevState,
            {
              name: theItem.name,
              price: Number(thePrice),
              rewards: '4',
              dna: theItem.dna,
              ownerID: ownerAdd,
              itemId: itemID,
              edition: theItem.edition,
              image: stringImage,
              attributes: theItem.attributes,
              dividendAmount: rarity.dividend,
              nftStyle: rarity.type,
              rankingPercentile: (Number(rarity.ranking)),
              mintedDate: theDate
            }
          ]))
        }
        if (rarity.dividend === 7) {
          setSoldier(prevState => ([
            ...prevState,
            {
              name: theItem.name,
              price: Number(thePrice),
              rewards: '2',
              dna: theItem.dna,
              ownerID: ownerAdd,
              itemId: itemID,
              edition: theItem.edition,
              image: stringImage,
              attributes: theItem.attributes,
              dividendAmount: rarity.dividend,
              nftStyle: rarity.type,
              rankingPercentile: (Number(rarity.ranking)),
              mintedDate: theDate
            }
          ]))
        }
        if (rarity.dividend === 1) {
          setMinion(prevState => ([
            ...prevState,
            {
              name: theItem.name,
              price: Number(thePrice),
              rewards: '1',
              dna: theItem.dna,
              ownerID: ownerAdd,
              itemId: itemID,
              edition: theItem.edition,
              image: stringImage,
              attributes: theItem.attributes,
              dividendAmount: rarity.dividend,
              nftStyle: rarity.type,
              rankingPercentile: (Number(rarity.ranking)),
              mintedDate: theDate
            }
          ]))
        }
        setAllNFT(prevState => ([
          ...prevState,
          {
            name: theItem.name,
            price: Number(thePrice),
            rewards: rarity.dividend == 25 ? '50' : rarity.dividend == 15 ? '6' : rarity.dividend == 12 ? '4' : rarity.dividend == 7 ? '2' : '1',
            dna: theItem.dna,
            ownerID: ownerAdd,
            itemId: itemID,
            edition: theItem.edition,
            image: stringImage,
            attributes: theItem.attributes,
            dividendAmount: rarity.dividend,
            nftStyle: rarity.type,
            rankingPercentile: (Number(rarity.ranking)),
            mintedDate: theDate
          }
        ]))
        setDisplayNFT(prevState => ([
          ...prevState,
          {
            name: theItem.name,
            price: Number(thePrice),
            rewards: rarity.dividend == 25 ? '50' : rarity.dividend == 15 ? '6' : rarity.dividend == 12 ? '4' : rarity.dividend == 7 ? '2' : '1',
            dna: theItem.dna,
            ownerID: ownerAdd,
            itemId: itemID,
            edition: theItem.edition,
            image: stringImage,
            attributes: theItem.attributes,
            dividendAmount: rarity.dividend,
            nftStyle: rarity.type,
            rankingPercentile: (Number(rarity.ranking)),
            mintedDate: theDate
          }
        ]))
        resolve('DONE')
      }).catch(error => {
        toast.error(String(error))
        resolve('error')
      })
      changeFilter(0)
      //setAllNFT([])
    })
  }
  const calculateXSUMORarity = (items, totalNFT) => {
    var avg = 10
    var theAvg = 0
    var theDividend = 0
    var theAttributes = []
    items.map((item, index) => (
      theAvg += (item.count / totalNFT)
    ))
    items.map((item, index) => (
      theAttributes.push(item.value + " " + items.frequency)
    ))
    if (items[0].trait_type.split('/')[0] == 'Emperor') {
      theDividend = 25
    } else if (items[0].trait_type.split('/')[0] == 'King') {
      //eye
      theDividend = 15
    } else if (items[0].trait_type.split('/')[0] == 'Knight') {
      //nipple
      theDividend = 12
    } else if (items[0].trait_type.split('/')[0] == 'Soldier') {
      // ear and mouth
      theDividend = 7
    } else {
      theDividend = 1
    }
    var theWeightRanking = 100 - ((theAvg / avg) * 100)

    if (theDividend === 25) {
      return { dividend: 25, type: 'Emperor', ranking: theWeightRanking, attribute: theAttributes }
    }
    else if (theDividend === 15) {
      return { dividend: 15, type: 'King', ranking: theWeightRanking, attribute: theAttributes }
    }
    else if (theDividend === 12) {
      return { dividend: 12, type: 'Knight', ranking: theWeightRanking, attribute: theAttributes }
    }
    else if (theDividend === 7) {
      return { dividend: 7, type: 'Soldier', ranking: theWeightRanking, attribute: theAttributes }
    }
    else if (theDividend === 1) {
      return { dividend: 1, type: 'Minion', ranking: theWeightRanking, attribute: theAttributes }
    }
    else return { dividend: 0, ranking: 'error' }
  }

  const calculateRarity = (items, totalNFT) => {
    var avg = 10
    var theAvg = 0
    var theDividend = 0
    items.map((item, index) => (
      theAvg += (item.count / totalNFT)
    ))
    if (items[5].value.split('_')[0] !== 'Common') {
      //hat
      theDividend = 25
    } else if (items[2].value.split('_')[0] !== 'common') {
      //eye
      theDividend = 15
    } else if (items[7].value.split('_')[0] !== 'common') {
      //nipple
      theDividend = 12
    } else if (items[8].value.split('_')[0] !== 'common' && items[6].value.split('_')[0] !== 'common') {
      // ear and mouth
      theDividend = 7
    } else {
      theDividend = 1
    }
    var theWeightRanking = 100 - ((theAvg / avg) * 100)

    if (theDividend === 25) {
      return { dividend: 25, type: 'Emperor', ranking: theWeightRanking }
    }
    else if (theDividend === 15) {
      return { dividend: 15, type: 'King', ranking: theWeightRanking }
    }
    else if (theDividend === 12) {
      return { dividend: 12, type: 'Knight', ranking: theWeightRanking }
    }
    else if (theDividend === 7) {
      return { dividend: 7, type: 'Soldier', ranking: theWeightRanking }
    }
    else if (theDividend === 1) {
      return { dividend: 1, type: 'Minion', ranking: theWeightRanking }
    }
    else return { dividend: 'error', ranking: 'error' }
  }
  const changeFilter = (filterValue) => {
    if (filterValue === 0) {
      let gfg = _.orderBy(allNFT, ['price'], ['asc']);
      setDisplayNFT(gfg)
      setSelectedFilter(0)
      setSelectedNFT(0)
    }
    else if (filterValue === 1) {
      let gfg = _.orderBy(emperor, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(1)
    }
    else if (filterValue === 2) {
      let gfg = _.orderBy(king, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(2)
    }
    else if (filterValue === 3) {
      let gfg = _.orderBy(knights, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(3)
    }
    else if (filterValue === 4) {
      let gfg = _.orderBy(soldier, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(4)
    }
    else if (filterValue === 5) {
      let gfg = _.orderBy(minion, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(5)
    }
    else if (filterValue === 6) {
      //lowest
      if (selectedNFT == 1) {
        let gfg = _.orderBy(machineFi, ['price'], ['asc']);
        console.log(gfg)
        setDisplayNFT(gfg)
      } else {
        let gfg = _.orderBy(displayingNFT, ['price'], ['asc']);
        console.log(gfg)
        setDisplayNFT(gfg)
      }
    }
    else if (filterValue === 7) {
      //highest
      if (selectedNFT == 1) {
        let gfg = _.orderBy(machineFi, ['price'], ['desc']);
        setDisplayNFT(gfg)
      } else {
        let gfg = _.orderBy(displayingNFT, ['price'], ['desc']);
        setDisplayNFT(gfg)
      }
    }
    else if (filterValue === 8) {
      //highest
      console.log(machineFi)
      setDisplayNFT(machineFi)
      setSelectedNFT(1)
    }
    else if (filterValue === 9) {
      setDisplayNFT(iotexDomain)
      setSelectedNFT(2)
    }
    else if (filterValue === 10) {
      setDisplayNFT(knowToEarn)
      setSelectedNFT(3)
    }
    else if (filterValue === 11) {
      setDisplayNFT(xsumo)
      setSelectedNFT(4)
      setSelectedFilter(11)
    }
    else if (filterValue === 12) {
      let gfg = _.orderBy(xemperor, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(12)
    }
    else if (filterValue === 13) {
      let gfg = _.orderBy(xking, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(13)
    }
    else if (filterValue === 14) {
      let gfg = _.orderBy(xknights, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(14)
    }
    else if (filterValue === 15) {
      let gfg = _.orderBy(xsoldier, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(15)
    }
    else if (filterValue === 16) {
      let gfg = _.orderBy(xminion, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(16)
    }
    else if (filterValue === 17) {
      let gfg = _.orderBy(giga, ['price'], ['asc']);
      console.log(gfg)
      setDisplayNFT(gfg)
      setSelectedFilter(17)
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
          flexDirection: 'row', minHeight: 30
        }}>
          {allNFT.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedNFT === 0 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(0)}
          >SUMO {allNFT.length}</div> : null}
          {machineFi.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedNFT === 1 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(8)}
          >MachineFi {machineFi.length}</div> : null}
          {iotexDomain.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedNFT === 2 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(9)}
          >IotexDomain {iotexDomain.length}</div> : null}
          {knowToEarn.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedNFT === 3 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(10)}
          >Know To Earn {knowToEarn.length}</div> : null}
          {xsumo.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedNFT === 4 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(11)}
          >XSUMO {xsumo.length}</div> : null}
        </Box>
        {selectedNFT == 0 ? <Box style={{
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
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>SUMOTEX for sale: {totalNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>Sold NFT: {soldNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>Floor Price: {(floorPrice)} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>Highest Sold Price: {(highestPrice).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="green" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "green" }}>Volume: {(volume).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
        </Box> : selectedNFT == 1 ? <Box style={{
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
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="rebeccapurple" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "rebeccapurple" }}>MachineFi for sale: {mtotalNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="rebeccapurple" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "rebeccapurple" }}>Sold NFT: {msoldNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="rebeccapurple" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "rebeccapurple" }}>Floor Price: {(mfloorPrice)} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="rebeccapurple" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "rebeccapurple" }}>Highest Sold Price: {(mhighestPrice).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="rebeccapurple" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "rebeccapurple" }}>Volume: {(mvolume).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
        </Box> : selectedNFT == 2 ? <Box style={{
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
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Iotex Web3 Domain for sale: {dtotalNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Sold NFT: {dsoldNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Floor Price: {(dfloorPrice)} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Highest Sold Price: {(dhighestPrice).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Volume: {(dvolume).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
        </Box> : selectedNFT == 3 ? <Box style={{
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
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Know To Earn for sale: {ktotalNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Sold NFT: {ksoldNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Floor Price: {(kfloorPrice)} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Highest Sold Price: {(khighestPrice).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Volume: {(kvolume).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
        </Box> : selectedNFT == 4 ? <Box style={{
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
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>XSUMO for sale: {xtotalNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Sold NFT: {xsoldNFT}</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Floor Price: {(xfloorPrice)} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Highest Sold Price: {(xhighestPrice).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
          <Box
            w={["80%", "80%", "20%", "18%"]} p="4" m="2" borderWidth='2px' borderColor="cadetblue" borderRadius='lg' >
            <h4 style={{ fontSize: 16, fontWeight: 'bold', color: "cadetblue" }}>Volume: {(xvolume).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</h4>
          </Box>
        </Box> : null}
        {selectedNFT == 0 ? <Box style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: "wrap",
          flexDirection: 'row', minHeight: 30
        }}>
          {allNFT.length !== 0 && emperor.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 1 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(1)}
          >Emperor {emperor.length}</div> : null}
          {allNFT.length !== 0 && king.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 2 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(2)}
          >King {king.length}</div> : null}
          {allNFT.length !== 0 && knights.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 3 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(3)}
          >Knight {knights.length}</div> : null}
          {allNFT.length !== 0 && soldier.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 4 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(4)}
          >Soldier {soldier.length}</div> : null}
          {allNFT.length !== 0 && minion.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 5 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(5)}
          >Minion {minion.length}</div> : null}
          {allNFT.length !== 0 ? <div style={{
            borderRadius: 12,
            backgroundColor: selectedFilter === 0 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
            color: 'rgb(60,103,89)',
            alignContent: 'center',
            padding: 10,
            paddingLeft: 20,
            paddingRight: 20,
            margin: 5,
            fontSize: 14
          }}
            onClick={() => changeFilter(0)}
          >All</div> : null}
        </Box> : null}
        {selectedNFT == 4 ? <Box style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: "wrap",
          flexDirection: 'row', minHeight: 30
        }}>
          {giga.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 17 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(17)}
          >Giga {giga.length}</div> : null}
          {xemperor.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 12 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(12)}
          >Emperor {xemperor.length}</div> : null}
          {xking.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 13 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(13)}
          >King {xking.length}</div> : null}
          {xknights.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 14 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(14)}
          >Knight {xknights.length}</div> : null}
          {xsoldier.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 15 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(15)}
          >Soldier {xsoldier.length}</div> : null}
          {xminion.length !== 0 ? <div
            style={{
              borderRadius: 12,
              backgroundColor: selectedFilter === 16 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
              color: 'rgb(60,103,89)',
              padding: 10,
              margin: 5,
              fontSize: 14
            }}
            onClick={() => changeFilter(16)}
          >Minion {xminion.length}</div> : null}
          <div style={{
            borderRadius: 12,
            backgroundColor: selectedFilter === 11 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
            color: 'rgb(60,103,89)',
            alignContent: 'center',
            padding: 10,
            paddingLeft: 20,
            paddingRight: 20,
            margin: 5,
            fontSize: 14
          }}
            onClick={() => changeFilter(11)}
          >All</div>
        </Box> : null}
        <Box style={{ display: 'flex', justifyContent: 'center' }}>
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
          {loading ? <Center>Loading...hold on for awhile</Center> :
            // allNFT.length === 0 ? <div style={{
            //   padding: 5,
            //   textAlign: "center"
            // }}>
            //   <Center style={{ display: 'flex', flexDirection: "row", margin: 20, flexWrap: "wrap", maxWidth: '100%' }}>
            //     <p>Loading...</p>
            //   </Center>
            // </div> :
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
                ariaHideApp={false}
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
                <Box style={{
                  justifyContent: 'center',
                  justifyItems: 'center',
                  display: 'flex',
                  flexWrap: "wrap",
                  flexDirection: 'column',
                  maxWidth: '100%'
                }}>
                  <h3 style={{ fontSize: 20, textAlign: 'center', fontWeight: 'bold', padding: 5 }}>{theModalNFT.name}</h3>
                  <img src={theModalNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={600} />
                  <p style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>ID: {theModalNFT.edition}</p>
                  <p style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', padding: 5 }}>APY: {theModalNFT.dividendAmount}%</p>
                </Box>
                <Box style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 'bold', color: 'green' }}>Price {theModalNFT.price} IOTX</p>
                  {boughtNFT ? <Link type="button" href={"https://display.sumotex.co"} >View it here</Link> :
                    <Button onClick={() => buyNFT(theModalNFT.itemId, theModalNFT.price)}
                      mt="5" bg="lightgreen"> {loadSpinner ? <Spinner /> : null} {'BUY NOW'}</Button>}
                </Box>
              </Modal>
              <Modal isOpen={modalIsOpen2} onAfterOpen={afterOpenModal}
                ariaHideApp={false}
                onRequestClose={closeModal2}
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
                {/* <Box m="5" borderWidth='3px' style={{ display: "flex", flexDirection: "column" }}> */}
                <Box style={{
                  margin: 10,
                  padding: 5,
                  paddingLeft: 20,
                  justifyContent: 'center',
                  justifyItems: 'center',
                  display: 'flex',
                  flexWrap: "wrap",
                  flexDirection: 'column',
                  maxWidth: '100%'
                }}>
                  <h3 style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>{machineFiNFT.name}</h3>
                  <img src={machineFiNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={600} />

                  <p style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>ID: {machineFiNFT.id}</p>
                </Box>
                <Box style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 'bold', color: 'green' }}>Price {machineFiNFT.price} IOTX</p>
                  {boughtNFT ? <p>Succesfully purchased!</p> :
                    <Button onClick={() => buyMachineFi(machineFiNFT.itemId, machineFiNFT.price)}
                      mt="5" bg="lightgreen" disabled={loadSpinner ? true : false}> {loadSpinner ? <Spinner /> : null} {'BUY NOW'}</Button>}
                </Box>
              </Modal>
              <Modal isOpen={modalIsOpen3} onAfterOpen={afterOpenModal}
                ariaHideApp={false}
                onRequestClose={closeModal3}
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
                {/* <Box m="5" borderWidth='3px' style={{ display: "flex", flexDirection: "column" }}> */}
                <Box style={{
                  margin: 10,
                  padding: 5,
                  paddingLeft: 20,
                  justifyContent: 'center',
                  justifyItems: 'center',
                  display: 'flex',
                  flexWrap: "wrap",
                  flexDirection: 'column',
                  maxWidth: '100%'
                }}>
                  <h3 style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>{iotexDomainNFT.name}</h3>
                  <img src={iotexDomainNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={600} />
                </Box>
                <Box style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 'bold', color: 'green' }}>Price {iotexDomainNFT.price} IOTX</p>
                  {boughtNFT ? <p>Succesfully purchased!</p> :
                    <Button onClick={() => buyIotexDomain(iotexDomainNFT.itemId, iotexDomainNFT.price)}
                      mt="5" bg="lightgreen" disabled={loadSpinner ? true : false}> {loadSpinner ? <Spinner /> : null} {'BUY NOW'}</Button>}
                </Box>
              </Modal>
              <Modal isOpen={modalIsOpen4} onAfterOpen={afterOpenModal}
                ariaHideApp={false}
                onRequestClose={closeModal4}
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
                {/* <Box m="5" borderWidth='3px' style={{ display: "flex", flexDirection: "column" }}> */}
                <Box style={{
                  margin: 10,
                  padding: 5,
                  paddingLeft: 20,
                  justifyContent: 'center',
                  justifyItems: 'center',
                  display: 'flex',
                  flexWrap: "wrap",
                  flexDirection: 'column',
                  maxWidth: '100%'
                }}>
                  <h3 style={{ textAlign: 'center', fontWeight: 'bold', padding: 5, fontSize: 20 }}>{knowNFT.name}</h3>
                  <img src={knowNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={600} />
                </Box>
                <Box style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 'bold', color: 'green' }}>Price {knowNFT.price} IOTX</p>
                  {boughtNFT ? <p>Succesfully purchased!</p> :
                    <Button onClick={() => buyKnowNFT(knowNFT.itemId, knowNFT.price)}
                      mt="5" bg="lightgreen" disabled={loadSpinner ? true : false}> {loadSpinner ? <Spinner /> : null} {'BUY NOW'}</Button>}
                </Box>
              </Modal>
              <Modal isOpen={modalIsOpen5} onAfterOpen={afterOpenModal}
                ariaHideApp={false}
                onRequestClose={closeModal5}
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
                {/* <Box m="5" borderWidth='3px' style={{ display: "flex", flexDirection: "column" }}> */}
                <Box style={{
                  margin: 10,
                  padding: 5,
                  paddingLeft: 20,
                  justifyContent: 'center',
                  justifyItems: 'center',
                  display: 'flex',
                  flexWrap: "wrap",
                  flexDirection: 'column',
                  maxWidth: '100%'
                }}>
                  <h3 style={{ textAlign: 'center', fontWeight: 'bold', padding: 5, fontSize: 20 }}>{xsumoNFT.name}</h3>
                  <img src={xsumoNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={400} />
                </Box>
                <Box style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 'bold', color: 'green' }}>Price {xsumoNFT.price} IOTX</p>
                  {boughtNFT ? <p>Succesfully purchased!</p> :

                    <Button onClick={() => buyXSUMONFT(xsumoNFT.itemId, xsumoNFT.price)}
                      mt="5" bg="lightgreen" disabled={loadSpinner ? true : false}> {loadSpinner ? <Spinner /> : null} {'BUY NOW'}</Button>}
                </Box>
              </Modal>
              {selectedNFT == 0 ? ([...new Set(displayingNFT)]).map((item, index) => {
                return (
                  <Lazyload key={item.edition} style={{
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
                    <p style={{ fontSize: 18, marginTop: 15, fontWeight: 'bold', color: "green" }}>{Number(item.price).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</p>
                    <p style={{ fontSize: 15, marginTop: 10, fontWeight: 'bold', color: "green" }}>Mining Rate: {(item.rewards)} SMTX daily</p>
                    <p style={{ fontSize: 12, margin: 5, fontWeight: '500', color: "grey" }}>(Upon SMTX coin launch)</p>
                    {!god.currentNetwork.account ? <p>Connect your wallet to purchase.</p> : item.ownerID == god.currentNetwork.account ? null : <Box onClick={() => setModalItems(item, 1)} as='button' borderRadius='md' mt="3" bg='green' color='white' minWidth={110} px={4} h={8}>
                      <p style={{ fontSize: 16, fontWeight: 'bold' }}>BUY</p>
                    </Box>}
                    <Accordion allowToggle mt={4} borderRadius={6}>
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box flex='1' textAlign='left'>
                              Attributes
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel>
                          <p style={{ marginTop: 30, fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' }}>Rarity</p>
                          {item.attributes.map((item, index) => {
                            return (<div style={{ marginLeft: 10, fontSize: 14, padding: 2, flexDirection: 'row' }}>{item.trait_type}: {item.value.split('_')[0]} {item.value.split('_')[1]}({item.frequency})</div>)
                          })}
                        </AccordionPanel>

                      </AccordionItem>
                    </Accordion>
                  </Lazyload>
                )
              }
              ) : selectedNFT == 1 ? ([...new Set(displayingNFT)]).map((item, index) => {
                return (
                  <Lazyload key={item.id} style={{
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
                    <h3 style={{ fontSize: 18, marginTop: 15, textAlign: 'center' }}>{item.name}</h3>
                    <p style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>ID: {item.id}</p>
                    <p style={{ textAlign: 'center', fontSize: 18, marginTop: 15, fontWeight: 'bold', color: "green" }}>{Number(item.price).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!god.currentNetwork.account ? <p>Connect your wallet to purchase.</p> : item.ownerID == god.currentNetwork.account ? null : <Box onClick={() => setModalItems2(item, 1)} as='button' borderRadius='md' mt="3" bg='green' color='white' minWidth={110} px={4} h={8}>
                        <p style={{ fontSize: 16, fontWeight: 'bold' }}>BUY</p>
                      </Box>}
                    </div>
                  </Lazyload>
                )
              }) : selectedNFT == 2 ? ([...new Set(displayingNFT)]).map((item, index) => {
                return (
                  <Lazyload key={item.id} style={{
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
                    <h3 style={{ fontSize: 24, marginTop: 15, textAlign: 'center' }}>{item.name}</h3>
                    <p style={{ textAlign: 'center', fontSize: 18, marginTop: 15, fontWeight: 'bold', color: "green" }}>{Number(item.price).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!god.currentNetwork.account ? <p>Connect your wallet to purchase.</p> : item.ownerID == god.currentNetwork.account ? null : <Box onClick={() => setModalItems3(item, 1)} as='button' borderRadius='md' mt="3" bg='green' color='white' minWidth={110} px={4} h={8}>
                        <p style={{ fontSize: 16, fontWeight: 'bold' }}>BUY</p>
                      </Box>}
                    </div>
                  </Lazyload>
                )
              }) : selectedNFT == 3 ? ([...new Set(displayingNFT)]).map((item, index) => {
                return (
                  <Lazyload key={item.id} style={{
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
                    <h3 style={{ fontSize: 24, marginTop: 15, textAlign: 'center' }}>{item.name}</h3>
                    <p style={{ textAlign: 'center', fontSize: 18, marginTop: 15, fontWeight: 'bold', color: "green" }}>{Number(item.price).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!god.currentNetwork.account ? <p>Connect your wallet to purchase.</p> : item.ownerID == god.currentNetwork.account ? null : <Box onClick={() => setModalItems4(item, 1)} as='button' borderRadius='md' mt="3" bg='green' color='white' minWidth={110} px={4} h={8}>
                        <p style={{ fontSize: 16, fontWeight: 'bold' }}>BUY</p>
                      </Box>}
                    </div>
                  </Lazyload>
                )
              }) : selectedNFT == 4 ? ([...new Set(displayingNFT)]).map((item, index) => {
                return (
                  <Lazyload key={item.edition} style={{
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
                    <p style={{ fontSize: 16, fontWeight: 'bold' }}>ID: {item.id}</p>
                    <p style={{ fontSize: 18, fontWeight: 'bold' }}>APY: {item.dividendAmount}%</p>
                    <p style={{ fontSize: 15, marginTop: 5, fontWeight: 'bold' }}>Seller: {(item.ownerID).slice(-5)}</p>
                    <p style={{ fontSize: 18, marginTop: 15, fontWeight: 'bold', color: "green" }}>{Number(item.price).toLocaleString(navigator.language, { minimumFractionDigits: 0 })} IOTX</p>
                    <p style={{ fontSize: 15, marginTop: 10, fontWeight: 'bold', color: "green" }}>Mining Rate: {(item.rewards)} SMTX daily</p>
                    {!god.currentNetwork.account ? <p>Connect your wallet to purchase.</p> : item.ownerID == god.currentNetwork.account ? null : <Box onClick={() => setModalItems5(item, 1)} as='button' borderRadius='md' mt="3" bg='green' color='white' minWidth={110} px={4} h={8}>
                      <p style={{ fontSize: 16, fontWeight: 'bold' }}>BUY</p>
                    </Box>}
                  </Lazyload>
                )
              }) : null}
            </div>
          }
        </div>
      </div>
    </div >
  );
});

export default Home;
