import React, { useState, useEffect } from 'react';
import { observer, useLocalStore } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import API from '../common/utils/API';
import marketplaceABI from '@/constants/abi/marketplace.json';
import machineFiABI from '@/constants/abi/machineFi.json';
import iotexDomainABI from '@/constants/abi/iotexDomain.json';
import KnowNFTABI from '@/constants/abi/knowToEarn.json';
import erc721 from '@/constants/abi/erc721.json';
import {
    Center, Container, Input, Box, Spinner, Button, Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    list,
} from '@chakra-ui/react';
import { useStore } from '../store/index';
import { StringState, BooleanState } from '../store/standard/base';
import TokenState from '../store/lib/TokenState';
import { BigNumberInputState } from '../store/standard/BigNumberInputState';
import { eventBus } from '../lib/event';
import { BigNumberState } from '../store/standard/BigNumberState';
import 'reactjs-popup/dist/index.css';
import Modal from 'react-modal';
import axios from 'axios';
import _ from 'lodash';

const ListforSale = observer(() => {
    const { god, token, lang } = useStore();
    const [state, setState] = useState({
        name: '',
        currentMinted: 0
    });
    const [userHasNFT, setUseHasNFT] = useState(false)
    const [loadSpinner, setSpinner] = useState(false)
    const [flag, setFlag] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalNFT, setTotalNFT] = useState(0)
    const [refreshPage, setRefreshPage] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState(0)
    const [selectedLength, setSelectedLength] = useState(0)
    const [userPrice, setPrice] = useState('')
    const [theModalNFT, setModalNFT] = useState({ image: '', name: '', edition: '', dividendAmount: '' })


    const [displayingNFT, setDisplayNFT] = useState([])
    //check listed sumo and itemID
    const [listIDNFT, setListedID] = useState([])
    const [itemID, setItemID] = useState([])
    //check listed machineFi and ItemID
    const [listMachineFiNFT, setListedMachineFiID] = useState([])
    const [listMachineFiNFTItemID, setListedMachineFiItemID] = useState([])
    const [allNFT, setAllNFT] = useState([])
    const [machineFi, setMachineFi] = useState([])
    const [machineFiNFT, setMachineFiModal] = useState({ id: '', image: '', name: '' })
    //Check for IOTEX DOMAIN NAME
    const [iotexDomain, setIOTEXDomain] = useState([])
    const [listIotexDomainNFT, setListedIotexDomainID] = useState([])
    const [listDomainItemID, setListedDomainItemID] = useState([])
    const [iotexDomainNFT, setIotexDomainModal] = useState({ id: '', image: '', name: '' })

    //Check for KNOW NFT
    const [knowToEarn, setKnowToEarn] = useState([])
    const [listKnowNFTID, setListedKnowNFTID] = useState([])
    const [listKnowNFTItemID, setListedKnowItemID] = useState([])
    const [knowToEarnNFT, setKnowToEarnNFTModal] = useState({ id: '', image: '', name: '' })

    //all emperor traits filter
    const [emperor, setEmperor] = useState([])
    const [king, setKing] = useState([])
    const [knights, setKnights] = useState([])
    const [soldier, setSoldier] = useState([])
    const [minion, setMinion] = useState([])
    //type of NFT
    //0 - SUMO
    //1 - MachinFI
    const [selectedNFT, setSelectedNFT] = useState(0)
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
        setAllNFT([])
        setDisplayNFT([])
        setEmperor([])
        setKing([])
        setKnights([])
        setSoldier([])
        setMinion([])
        setIOTEXDomain([])
        setMachineFi([])
        setKnowToEarn([])
        setListedIotexDomainID([])
        theInitialFunction();

    }, [refreshPage]);

    const theInitialFunction = async () => {
        await god.currentNetwork.multicall(
            [
                god.currentNetwork.account ? newToken.preMulticall({ method: 'totalSupply', handler: newToken.balance }) : null,
                newToken.preMulticall({ method: 'name', handler: (v: any) => (newToken.name = v.toString()) }),
            ].filter((i) => !!i)
        );
        store.curToken = newToken;
        setState({
            name: newToken.name,
            currentMinted: newToken._balance.value.c[0]
        })
        try {
            let theAddress = await god.currentNetwork.execContract({
                address: newToken.address,
                abi: newToken.abi,
                method: "walletOfOwner",
                params: [god.currentNetwork.account]
            })
            if (theAddress instanceof Array) {
                setTotalNFT(theAddress.length)
                var numberArray = [...theAddress]
                filterNFTs(numberArray)
                //sliceNFT(numberArray)
                if (theAddress.length !== 0) {
                    setUseHasNFT(true)
                }
                setLoading(false)
            }
        }
        catch (e) {
            console.log(e)
        }
        //fetch machinfiNFT
        let theListedNFT = await god.currentNetwork.execContract({
            address: '0x7C3CaCc88e469ED9365FeDe9426E947A985ae495',
            abi: marketplaceABI,
            method: "fetchMyNFTs",
            params: []
        })

        if (theListedNFT instanceof Array) {
            var theArray = theListedNFT.filter(function (item) {
                return (item['nftContract']) == "0x9756E951dd76e933e34434Db4Ed38964951E588b"
            })
            theArray = theArray.filter(function (item) {
                return (item['tokenId']).toNumber() !== 0;
            })
            var theArray2 = theArray.filter(function (item) {
                return (item['sold']) == false;
            })
            var theArrayItem = []
            var theIndexItem = []
            theArray2.map((item, index) => {
                theArrayItem.push(item['tokenId'].toNumber())
                theIndexItem.push(item['itemId'].toNumber())
                setListedID(theArrayItem)
                setItemID(theIndexItem);
            })
            var machineFiNFTMarketplace = theListedNFT.filter(function (item) {
                return (item['nftContract']) == '0x0c5AB026d74C451376A4798342a685a0e99a5bEe';
            })
            machineFiNFTMarketplace = machineFiNFTMarketplace.filter(function (item) {
                return (item['sold']) == false;
            })
            machineFiNFTMarketplace = machineFiNFTMarketplace.filter(function (item) {
                return (item['tokenId']).toNumber() !== 0;
            })
        }
        if (machineFiNFTMarketplace.length != 0) {
            machineFiNFTMarketplace.map((item, index) => {
                theArrayItem.push(item['tokenId'].toNumber())
                theIndexItem.push(item['itemId'].toNumber())
                setListedMachineFiID(theArrayItem)
                setListedMachineFiItemID(theIndexItem)
            })
        }
        let machineFiGetBalance = await god.currentNetwork.execContract({
            address: '0x0c5AB026d74C451376A4798342a685a0e99a5bEe',
            abi: machineFiABI,
            method: "balanceOf",
            //params: ['0xEb17b644153e222D33Ac48bfBBCB8e98F45bfa19']
            params: [god.currentNetwork.account]
        })
        for (var i = 0; i < machineFiGetBalance; i++) {
            let machineFiNFTArray = await god.currentNetwork.execContract({
                address: '0x0c5AB026d74C451376A4798342a685a0e99a5bEe',
                abi: machineFiABI,
                method: "tokenOfOwnerByIndex",
                //params: ['0xEb17b644153e222D33Ac48bfBBCB8e98F45bfa19', i]
                params: [god.currentNetwork.account, i]
            })
            getMachinefiNFT(machineFiNFTArray);
        }
        if (theListedNFT instanceof Array) {
            var iotexDomainNFTMarketplace = theListedNFT.filter(function (item) {
                return (item['nftContract']) == '0x4608eF714C8047771054757409c1A451CEf8d69f';
            })
            var theUnsold = iotexDomainNFTMarketplace.filter(function (item) {
                return (item['sold']) != true;
            })
            if (theUnsold.length != 0) {
                theUnsold.map((item, index) => {
                    theArrayItem.push(String(item['tokenId']))
                    theIndexItem.push((item['itemId']).toNumber())
                    setListedIotexDomainID(theArrayItem)
                    setListedDomainItemID(theIndexItem)
                })
            }
            let iotexDomainGetBalance = await god.currentNetwork.execContract({
                address: '0x4608eF714C8047771054757409c1A451CEf8d69f',
                abi: iotexDomainABI,
                method: "balanceOf",
                //params: ['0xEb17b644153e222D33Ac48bfBBCB8e98F45bfa19']
                params: [god.currentNetwork.account]
            })
            for (var i = 0; i < iotexDomainGetBalance; i++) {
                let iotexDomainGetBalanceArray = await god.currentNetwork.execContract({
                    address: '0x4608eF714C8047771054757409c1A451CEf8d69f',
                    abi: iotexDomainABI,
                    method: "tokenOfOwnerByIndex",
                    //params: ['0xEb17b644153e222D33Ac48bfBBCB8e98F45bfa19', i]
                    params: [god.currentNetwork.account, i]
                })
                getIOTEXDomainNFT(iotexDomainGetBalanceArray);
            }
        }
        if (theListedNFT instanceof Array) {
            var knowToEarnNFT = theListedNFT.filter(function (item) {
                return (item['nftContract']) == '0xf129A758650A340958AEc74afc2E8D1E52180290';
            })
            var theUnsold = knowToEarnNFT.filter(function (item) {
                return (item['sold']) != true;
            })
            if (theUnsold.length != 0) {
                theUnsold.map((item, index) => {
                    theArrayItem.push(String(item['tokenId']))
                    theIndexItem.push((item['itemId']).toNumber())
                    console.log(theArrayItem,theIndexItem)
                    setListedKnowNFTID(theArrayItem)
                    setListedKnowItemID(theIndexItem)
                })
            }
            let knowToEarnBalance = await god.currentNetwork.execContract({
                address: '0xf129A758650A340958AEc74afc2E8D1E52180290',
                abi: KnowNFTABI,
                method: "balanceOf",
                //params: ['0xEA934138CFEF2c5efedf2b670B93Fb6827295cC4']
                params: [god.currentNetwork.account]
            })
            
            for (var i = 0; i < Number(knowToEarnBalance); i++) {
                let knowToEarnBalanceArray = await god.currentNetwork.execContract({
                    address: '0xf129A758650A340958AEc74afc2E8D1E52180290',
                    abi: KnowNFTABI,
                    method: "tokenOfOwnerByIndex",
                    //params: ['0xEA934138CFEF2c5efedf2b670B93Fb6827295cC4', i]
                    params: [god.currentNetwork.account, i]
                })

                getKnowToEarnNFT(Number(knowToEarnBalanceArray));
            }
        }

    }
    const delistNFT = async (item) => {
        var theItemIndex = (listIDNFT.indexOf(item));
        var delistItem = itemID[theItemIndex];
        setSpinner(true)
        //var delistItem = item.toNumber()
        try {
            let theListedNFT = await god.currentNetwork.execContract({
                address: '0x7C3CaCc88e469ED9365FeDe9426E947A985ae495',
                abi: marketplaceABI,
                method: "delistNFT",
                params: ["0x9756E951dd76e933e34434Db4Ed38964951E588b", delistItem]
            })
            let theReceipt = await theListedNFT.wait(); // to get the wait done
            if (theReceipt.status == 1) {
                setSpinner(false)
                toast.success(String('Succesfully Delisted' + theReceipt.transactionHash))
                setRefreshPage(!refreshPage)
            }
        }
        catch (e) {
            if (e.code == 4001) {
                setSpinner(false)
                toast.error(String(e.message))
            }
        }
    }
    const delistMachineFiNFT = async (item) => {
        var theItemIndex = (listMachineFiNFT.indexOf(item));
        var delistItem = listMachineFiNFTItemID[theItemIndex];
        setSpinner(true)
        //var delistItem = item.toNumber()
        try {
            let theListedNFT = await god.currentNetwork.execContract({
                address: '0x7C3CaCc88e469ED9365FeDe9426E947A985ae495',
                abi: marketplaceABI,
                method: "delistNFT",
                params: ["0x0c5AB026d74C451376A4798342a685a0e99a5bEe", delistItem]
            })
            let theReceipt = await theListedNFT.wait(); // to get the wait done
            if (theReceipt.status == 1) {
                setSpinner(false)
                toast.success(String('Succesfully Delisted' + theReceipt.transactionHash))
                setRefreshPage(!refreshPage)
            }
        }
        catch (e) {
            if (e.code == 4001) {
                setSpinner(false)
                toast.error(String(e.message))
            }
        }
    }
    const delistIotexDomainNFT = async (item) => {
        var theItemIndex = (listIotexDomainNFT.indexOf(item));
        var delistItem = listDomainItemID[theItemIndex];
        setSpinner(true)
        //var delistItem = item.toNumber()
        try {
            let theListedNFT = await god.currentNetwork.execContract({
                address: '0x7C3CaCc88e469ED9365FeDe9426E947A985ae495',
                abi: marketplaceABI,
                method: "delistNFT",
                params: ["0x4608eF714C8047771054757409c1A451CEf8d69f", delistItem]
            })
            let theReceipt = await theListedNFT.wait(); // to get the wait done
            if (theReceipt.status == 1) {
                setSpinner(false)
                toast.success(String('Succesfully Delisted' + theReceipt.transactionHash))
                setRefreshPage(!refreshPage)
            }
        }
        catch (e) {
            if (e.code == 4001) {
                setSpinner(false)
                toast.error(String(e.message))
            }
        }

    }
    const delistKnowToEarnNFT = async (item) => {
        var theItemIndex = (listKnowNFTID.indexOf(item));
        var delistItem = listKnowNFTItemID[theItemIndex];
        console.log(theItemIndex,delistItem)
        setSpinner(true)
        //var delistItem = item.toNumber()
        try {
            let theListedNFT = await god.currentNetwork.execContract({
                address: '0x7C3CaCc88e469ED9365FeDe9426E947A985ae495',
                abi: marketplaceABI,
                method: "delistNFT",
                params: ["0xf129A758650A340958AEc74afc2E8D1E52180290", delistItem]
            })
            let theReceipt = await theListedNFT.wait(); // to get the wait done
            if (theReceipt.status == 1) {
                setSpinner(false)
                toast.success(String('Succesfully Delisted' + theReceipt.transactionHash))
                setRefreshPage(!refreshPage)
            }
        }
        catch (e) {
            if (e.code == 4001) {
                setSpinner(false)
                toast.error(String(e.message))
            }
        }

    }
    const listItemForSale = async (item) => {
        //marketplace-address: 0x4A115815028777F94ad07e20eED7C2ABcCa99730
        if (flag == 0) {
            setSpinner(true)
            try {
                let theApproval = await god.currentNetwork.execContract({
                    address: "0x9756E951dd76e933e34434Db4Ed38964951E588b",
                    abi: erc721,
                    method: "setApprovalForAll",
                    params: ["0x7C3CaCc88e469ED9365FeDe9426E947A985ae495", true]
                    //params: ["0x7C3CaCc88e469ED9365FeDe9426E947A985ae495", Number(theNFT.edition)]
                })

                let theReceipt = await theApproval.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    let approvalStatus = await god.currentNetwork.execContract({
                        address: "0x9756E951dd76e933e34434Db4Ed38964951E588b",
                        abi: erc721,
                        method: "isApprovedForAll",
                        params: [god.currentNetwork.account, "0x7C3CaCc88e469ED9365FeDe9426E947A985ae495"]
                    })
                    if (approvalStatus == true) {
                        setSpinner(false)
                        setFlag(1)
                    }

                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }

        else if (flag == 1) {
            setSpinner(true)
            try {
                var listAmount = userPrice + '0'.repeat(18);
                let theAddress = await god.currentNetwork.execContract({
                    address: "0x7C3CaCc88e469ED9365FeDe9426E947A985ae495",
                    abi: marketplaceABI,
                    method: "createMarketItem",
                    params: [
                        "0x9756E951dd76e933e34434Db4Ed38964951E588b",
                        item.edition,
                        listAmount,
                        "100000000000000000000"
                    ]
                })

                let theReceipt = await theAddress.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    setSpinner(false)
                    setRefreshPage(!refreshPage)
                    toast.success(String('Succesfully Listed' + theReceipt.transactionHash))
                    setFlag(0)
                    closeModal()

                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
    }
    const listMachineFiForSale = async (item) => {
        //marketplace-address: 0x4A115815028777F94ad07e20eED7C2ABcCa99730
        if (flag == 0) {
            setSpinner(true)
            try {
                let theApproval = await god.currentNetwork.execContract({
                    address: "0x0c5AB026d74C451376A4798342a685a0e99a5bEe",
                    abi: erc721,
                    method: "setApprovalForAll",
                    params: ["0x7C3CaCc88e469ED9365FeDe9426E947A985ae495", true]
                    //params: ["0x7C3CaCc88e469ED9365FeDe9426E947A985ae495", Number(theNFT.edition)]
                })

                let theReceipt = await theApproval.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    let approvalStatus = await god.currentNetwork.execContract({
                        address: "0x0c5AB026d74C451376A4798342a685a0e99a5bEe",
                        abi: erc721,
                        method: "isApprovedForAll",
                        params: [god.currentNetwork.account, "0x7C3CaCc88e469ED9365FeDe9426E947A985ae495"]
                    })
                    if (approvalStatus == true) {
                        toast.success(String('Approved! Txn:' + theReceipt.transactionHash))
                        setSpinner(false)
                        setFlag(1)
                    }

                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
        else if (flag == 1) {
            setSpinner(true)
            try {
                var listAmount = userPrice + '0'.repeat(18);
                let theAddress = await god.currentNetwork.execContract({
                    address: "0x7C3CaCc88e469ED9365FeDe9426E947A985ae495",
                    abi: marketplaceABI,
                    method: "createMarketItem",
                    params: [
                        "0x0c5AB026d74C451376A4798342a685a0e99a5bEe",
                        item.id,
                        listAmount,
                        "100000000000000000000"
                    ]
                })

                let theReceipt = await theAddress.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    setSpinner(false)
                    toast.success(String('Succesfully Listed' + theReceipt.transactionHash))
                    setFlag(0)
                    closeModal2()
                    setRefreshPage(!refreshPage)
                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
    }
    const listIOTEXDomainForSale = async (item) => {
        //marketplace-address: 0x4A115815028777F94ad07e20eED7C2ABcCa99730
        if (flag == 0) {
            setSpinner(true)
            try {
                let theApproval = await god.currentNetwork.execContract({
                    address: "0x4608eF714C8047771054757409c1A451CEf8d69f",
                    abi: iotexDomainABI,
                    method: "setApprovalForAll",
                    params: ["0x7C3CaCc88e469ED9365FeDe9426E947A985ae495", true]
                    //params: ["0x7C3CaCc88e469ED9365FeDe9426E947A985ae495", Number(theNFT.edition)]
                })

                let theReceipt = await theApproval.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    let approvalStatus = await god.currentNetwork.execContract({
                        address: "0x4608ef714c8047771054757409c1a451cef8d69f",
                        abi: iotexDomainABI,
                        method: "isApprovedForAll",
                        params: [god.currentNetwork.account, "0x7C3CaCc88e469ED9365FeDe9426E947A985ae495"]
                    })
                    if (approvalStatus == true) {
                        toast.success(String('Approved! Txn:' + theReceipt.transactionHash))
                        setSpinner(false)
                        setFlag(1)
                    }

                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
        else if (flag == 1) {
            setSpinner(true)
            try {
                var listAmount = userPrice + '0'.repeat(18);
                let theAddress = await god.currentNetwork.execContract({
                    address: "0x7C3CaCc88e469ED9365FeDe9426E947A985ae495",
                    abi: marketplaceABI,
                    method: "createMarketItem",
                    params: [
                        "0x4608eF714C8047771054757409c1A451CEf8d69f",
                        item.id,
                        listAmount,
                        "100000000000000000000"
                    ]
                })
                let theReceipt = await theAddress.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    setSpinner(false)
                    toast.success(String('Succesfully Listed' + theReceipt.transactionHash))
                    setRefreshPage(!refreshPage)
                    setFlag(0)
                    closeModal3()
                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
    }
    const listKnowNFTForSale = async (item) => {
        //marketplace-address: 0x4A115815028777F94ad07e20eED7C2ABcCa99730
        if (flag == 0) {
            setSpinner(true)
            try {
                let theApproval = await god.currentNetwork.execContract({
                    address: "0xf129A758650A340958AEc74afc2E8D1E52180290",
                    abi: KnowNFTABI,
                    method: "setApprovalForAll",
                    params: ["0x7C3CaCc88e469ED9365FeDe9426E947A985ae495", true]
                    //params: ["0x7C3CaCc88e469ED9365FeDe9426E947A985ae495", Number(theNFT.edition)]
                })

                let theReceipt = await theApproval.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    let approvalStatus = await god.currentNetwork.execContract({
                        address: "0xf129A758650A340958AEc74afc2E8D1E52180290",
                        abi: KnowNFTABI,
                        method: "isApprovedForAll",
                        params: [god.currentNetwork.account, "0x7C3CaCc88e469ED9365FeDe9426E947A985ae495"]
                    })
                    if (approvalStatus == true) {
                        toast.success(String('Approved! Txn:' + theReceipt.transactionHash))
                        setSpinner(false)
                        setFlag(1)
                    }

                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
        else if (flag == 1) {
            setSpinner(true)
            try {
                var listAmount = userPrice + '0'.repeat(18);
                let theAddress = await god.currentNetwork.execContract({
                    address: "0x7C3CaCc88e469ED9365FeDe9426E947A985ae495",
                    abi: marketplaceABI,
                    method: "createMarketItem",
                    params: [
                        "0xf129A758650A340958AEc74afc2E8D1E52180290",
                        item.id,
                        listAmount,
                        "100000000000000000000"
                    ]
                })
                let theReceipt = await theAddress.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    setSpinner(false)
                    toast.success(String('Succesfully Listed' + theReceipt.transactionHash))
                    setRefreshPage(!refreshPage)
                    setFlag(0)
                    closeModal3()
                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
    }
    const getMachinefiNFT = async (item) => {
        let details = await god.currentNetwork.execContract(
            {
                address: '0x0c5AB026d74C451376A4798342a685a0e99a5bEe',
                abi: machineFiABI,
                method: 'tokenURI',
                params: [item.toNumber()]
            })
        let itemDetails = String(details)
        let theItemsNFT = JSON.parse(itemDetails)
        setMachineFi(prevState => ([
            ...prevState, {
                id: item.toNumber(),
                name: theItemsNFT['name'],
                image: theItemsNFT['image']
            }]))
    }
    const getIOTEXDomainNFT = async (item) => {

        let details = await god.currentNetwork.execContract(
            {
                address: '0x4608eF714C8047771054757409c1A451CEf8d69f',
                abi: iotexDomainABI,
                method: 'tokenURI',
                params: [String(item)]
            })
        API.get(details).then(res => {
            var theNFT = res.data

            setIOTEXDomain(prevState => ([
                ...prevState, {
                    id: String(item),
                    name: theNFT['name'],
                    image: theNFT['image']
                }]))
        })

    }
    const getKnowToEarnNFT = async (item) => {
        let details = await god.currentNetwork.execContract(
            {
                address: '0xf129A758650A340958AEc74afc2E8D1E52180290',
                abi: KnowNFTABI,
                method: 'tokenURI',
                params: [String(item)]
            })
        var headers = {
            "Content-Type": "application/json",
        }
        API.get(details, headers).then(myJson => {
            let theRemovedString = (myJson.data).trim().replace(/("|{|}\r\n|\n|\r)/gm, "");
            let theVariable = (theRemovedString.split(','))
            let name=(theVariable[0].split(':')[1])
            let image=(theVariable[2].split(':').slice(1).join(':'))
            setKnowToEarn(prevState => ([
                ...prevState, {
                    id: String(item),
                    name: name,
                    image:image
                }]))
        })

    }
    const filterNFTs = async (array) => {
        array.map(async (item, index) => {
            let details = await god.currentNetwork.execContract(
                {
                    address: newToken.address,
                    abi: newToken.abi,
                    method: 'tokenURI',
                    params: [item]
                })
            let itemDetails = String(details)
            var last = itemDetails.substring(itemDetails.lastIndexOf("/") + 1, itemDetails.length);
            var url = ('https://sumotex.mypinata.cloud/ipfs/Qme4K7ZKYaXTKSVX9Pwthauqu2P86wTvbBHtkdqmSPGo73/' + last)
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
                            dna: theItem.dna,
                            rewards: rarity.dividend == 25 ? '5.56' : rarity.dividend == 15 ? '0.67' : rarity.dividend == 12 ? '0.52' : rarity.dividend == 7 ? '0.27' : '0.22',
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
                            dna: theItem.dna,
                            rewards: rarity.dividend == 25 ? '5.56' : rarity.dividend == 15 ? '0.67' : rarity.dividend == 12 ? '0.52' : rarity.dividend == 7 ? '0.27' : '0.22',
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
                            dna: theItem.dna,
                            edition: theItem.edition,
                            rewards: rarity.dividend == 25 ? '5.56' : rarity.dividend == 15 ? '0.67' : rarity.dividend == 12 ? '0.52' : rarity.dividend == 7 ? '0.27' : '0.22',
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
                            dna: theItem.dna,
                            rewards: rarity.dividend == 25 ? '5.56' : rarity.dividend == 15 ? '0.67' : rarity.dividend == 12 ? '0.52' : rarity.dividend == 7 ? '0.27' : '0.22',
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
                            dna: theItem.dna,
                            rewards: rarity.dividend == 25 ? '5.56' : rarity.dividend == 15 ? '0.67' : rarity.dividend == 12 ? '0.52' : rarity.dividend == 7 ? '0.27' : '0.22',
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
                        dna: theItem.dna,
                        rewards: rarity.dividend == 25 ? '5.56' : rarity.dividend == 15 ? '0.67' : rarity.dividend == 12 ? '0.52' : rarity.dividend == 7 ? '0.27' : '0.22',
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
                        dna: theItem.dna,
                        rewards: rarity.dividend == 25 ? '5.56' : rarity.dividend == 15 ? '0.67' : rarity.dividend == 12 ? '0.52' : rarity.dividend == 7 ? '0.27' : '0.22',
                        edition: theItem.edition,
                        image: stringImage,
                        attributes: theItem.attributes,
                        dividendAmount: rarity.dividend,
                        nftStyle: rarity.type,
                        rankingPercentile: (Number(rarity.ranking)),
                        mintedDate: theDate
                    }
                ]))

            }).catch(error => {
                console.log(error)
            })
        });
        changeFilter(0)
        //setAllNFT([])
    }
    const [modalIsOpen, setIsOpen] = useState(false);
    const [modalIsOpen2, setIsOpen2] = useState(false);
    const [modalIsOpen3, setIsOpen3] = useState(false);
    const [modalIsOpen4, setIsOpen4] = useState(false);

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
        setKnowToEarnNFTModal(item)

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
            var theArray = _.uniqBy(allNFT, 'edition')
            setDisplayNFT(theArray)
            setSelectedFilter(0)
            setSelectedLength(theArray.length)
            setSelectedNFT(0)
        }
        else if (filterValue === 1) {
            setDisplayNFT(emperor)
            setSelectedFilter(1)
            setSelectedLength(emperor.length)
        }
        else if (filterValue === 2) {
            setDisplayNFT(king)
            setSelectedFilter(2)
            setSelectedLength(king.length)
        }
        else if (filterValue === 3) {
            setDisplayNFT(knights)
            setSelectedFilter(3)
            setSelectedLength(knights.length)
        }
        else if (filterValue === 4) {
            setDisplayNFT(soldier)
            setSelectedFilter(4)
            setSelectedLength(soldier.length)
        }
        else if (filterValue === 5) {
            setDisplayNFT(minion)
            setSelectedFilter(5)
            setSelectedLength(minion.length)
        } else if (filterValue === 6) {
            setDisplayNFT(machineFi)
            setSelectedNFT(1)
            setSelectedLength(machineFi.length)
        }
        else if (filterValue === 7) {
            setDisplayNFT(iotexDomain)
            setSelectedNFT(2)
            setSelectedLength(iotexDomain.length)
        }
        else if (filterValue === 8) {
            setDisplayNFT(knowToEarn)
            setSelectedNFT(3)
            setSelectedLength(knowToEarn.length)
        }
    }

    return (
        <div>
            {loading ? null : <div style={{ justifyItems: "center", margin: 10, width: '100%' }}>
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
                        onClick={() => changeFilter(6)}
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
                        onClick={() => changeFilter(7)}
                    >IOTEX Web3 Domain {iotexDomain.length}</div> : null}
                    {knowToEarn.length !== 0 ? <div
                        style={{
                            borderRadius: 12,
                            backgroundColor: selectedNFT === 3 ? 'rgba(126,208, 123,1)' : 'rgba(126,208, 123,0.3)',
                            color: 'rgb(60,103,89)',
                            padding: 10,
                            margin: 5,
                            fontSize: 14
                        }}
                        onClick={() => changeFilter(8)}
                    >Knowtoearn NFT {knowToEarn.length}</div> : null}
                </Box>

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
                    <div style={{
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
                    >All</div>
                </Box> : null}
            </div>}
            <div>
                <div>
                    {!god.currentNetwork.account ? <Center>Wallet not connected</Center> : loading ? <Center>Loading</Center> : 
                    allNFT.length === 0 && machineFi.length === 0 && iotexDomain.length === 0 && knowToEarn.length === 0 ? <div style={{
                        padding: 10,
                        textAlign: "center"
                    }}>
                        {/* {loading?"":!userHasNFT?"No NFT minted with this account.": null}*/}
                        <Center style={{ display: 'flex', flexDirection: "row", margin: 20, flexWrap: "wrap", maxWidth: '100%' }}>
                            <p>No NFT available in wallet: {god.currentNetwork.account}</p>
                        </Center>
                    </div> :
                        <Center>
                            <Container style={{
                                margin: 10,
                                padding: 5,
                                paddingLeft: 30,
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
                                    {/* <Box m="5" borderWidth='3px' style={{ display: "flex", flexDirection: "column" }}> */}
                                    <Box style={{
                                        margin: 10,
                                        padding: 5,
                                        paddingLeft: 30,
                                        justifyContent: 'center',
                                        justifyItems: 'center',
                                        display: 'flex',
                                        flexWrap: "wrap",
                                        flexDirection: 'column',
                                        maxWidth: '100%'
                                    }}>
                                        <h3 style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>{theModalNFT.name}</h3>
                                        <img src={theModalNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={140} />
                                        <p style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>ID: {theModalNFT.edition}</p>
                                        <p style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', padding: 5 }}>APY: {theModalNFT.dividendAmount}%</p>

                                    </Box>
                                    <Box style={{ padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: 10 }}>List {theModalNFT.name} for sale</p>
                                        {flag == 1 ? <div><p>Price</p> <Input value={userPrice} onChange={e => setPrice((e.target.value))} color='teal' placeholder='IOTX' variant='outline' type="number" /></div> : null}
                                        <Button onClick={() => listItemForSale(theModalNFT)} mt="5" bg="lightgreen" disabled={loadSpinner ? true : false}>   {loadSpinner ? <Spinner /> : null} {flag == 0 ? "Approve Item for Sale" : "List Item for SALE"}</Button>
                                    </Box>
                                    <Box style={{ padding: 10, fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p>Please be aware that its a 2 step process to list for sale.</p>
                                        <p>1. Approve it for marketplace to sell it.</p>
                                        <p>2. List it for sale and wait for it to be completed.</p>
                                        <p>(It might take awhile because of the multiple contract verifications.)</p>
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
                                            marginRight: '-20%',
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
                                        <img src={machineFiNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={140} />

                                        <p style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>ID: {machineFiNFT.id}</p>
                                    </Box>
                                    <Box style={{ padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: 10 }}>List {machineFiNFT.name} for sale</p>
                                        {flag == 1 ? <div><p>Price</p> <Input value={userPrice} onChange={e => setPrice((e.target.value))} color='teal' placeholder='IOTX' variant='outline' type="number" /></div> : null}
                                        <Button onClick={() => listMachineFiForSale(machineFiNFT)} mt="5" bg="lightgreen" disabled={loadSpinner ? true : false}>   {loadSpinner ? <Spinner /> : null} {flag == 0 ? "Approve Item for Sale" : "List Item for SALE"}</Button>
                                    </Box>
                                    <Box style={{ padding: 10, fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p>Please be aware that its a 2 step process to list for sale.</p>
                                        <p>1. Approve it for marketplace to sell it.</p>
                                        <p>2. List it for sale and wait for it to be completed.</p>
                                        <p>(It might take awhile because of the multiple contract verifications.)</p>
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
                                            marginRight: '-20%',
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
                                        <img src={iotexDomainNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={140} />
                                    </Box>
                                    <Box style={{ padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: 10 }}>List {iotexDomainNFT.name} for sale</p>
                                        {flag == 1 ? <div><p>Price</p> <Input value={userPrice} onChange={e => setPrice((e.target.value))} color='teal' placeholder='IOTX' variant='outline' type="number" /></div> : null}
                                        <Button onClick={() => listIOTEXDomainForSale(iotexDomainNFT)} mt="5" bg="lightgreen" disabled={loadSpinner ? true : false}>   {loadSpinner ? <Spinner /> : null} {flag == 0 ? "Approve Item for Sale" : "List Item for SALE"}</Button>
                                    </Box>
                                    <Box style={{ padding: 10, fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p>Please be aware that its a 2 step process to list for sale.</p>
                                        <p>1. Approve it for marketplace to sell it.</p>
                                        <p>2. List it for sale and wait for it to be completed.</p>
                                        <p>(It might take awhile because of the multiple contract verifications.)</p>
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
                                            marginRight: '-20%',
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
                                        <h3 style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>{knowToEarnNFT.name}</h3>
                                        <img src={knowToEarnNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={140} />


                                    </Box>
                                    <Box style={{ padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: 10 }}>List {knowToEarnNFT.name} for sale</p>
                                        {flag == 1 ? <div><p>Price</p> <Input value={userPrice} onChange={e => setPrice((e.target.value))} color='teal' placeholder='IOTX' variant='outline' type="number" /></div> : null}
                                        <Button onClick={() => listKnowNFTForSale(knowToEarnNFT)} mt="5" bg="lightgreen" disabled={loadSpinner ? true : false}>   {loadSpinner ? <Spinner /> : null} {flag == 0 ? "Approve Item for Sale" : "List Item for SALE"}</Button>
                                    </Box>
                                    <Box style={{ padding: 10, fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p>Please be aware that its a 2 step process to list for sale.</p>
                                        <p>1. Approve it for marketplace to sell it.</p>
                                        <p>2. List it for sale and wait for it to be completed.</p>
                                        <p>(It might take awhile because of the multiple contract verifications.)</p>
                                    </Box>
                                </Modal>
                                {selectedNFT == 0 ? ([...new Set(displayingNFT)]).map((item, index) => {
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
                                            <p style={{ fontSize: 15, marginTop: 5, marginBottom: 10, fontWeight: 'bold' }}>Ranking: {item.nftStyle}</p>
                                            <p style={{ fontSize: 15, marginTop: 10, fontWeight: 'bold', color: "green" }}>Mining Rate: {(item.rewards)} SMTX daily</p>
                                            <p style={{ fontSize: 12, marginTop: 5, marginBottom: 10, fontWeight: '500', color: "grey" }}>(Upon SMTX coin launch)</p>
                                            {listIDNFT.includes(item.edition) ? <Button bg="red" alignSelf={'center'} color="white" onClick={() => delistNFT(item.edition)} disabled={loadSpinner && theModalNFT.edition == item.edition ? true : false}> {loadSpinner ? <Spinner /> : null}De list {item.edition}</Button> : <Button bg="darkslateblue" color="white" onClick={() => setModalItems(item, 1)} disabled={loadSpinner && theModalNFT.edition == item.edition ? true : false}>List {item.edition}</Button>}
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
                                        </div>
                                    )
                                }
                                ) : selectedNFT == 1 ? ([...new Set(displayingNFT)]).map((item, index) => {
                                    return (
                                        <div key={item.id} style={{
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
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {listMachineFiNFT.includes(item.id) ? <Button bg="red"
                                                    alignSelf={'center'}
                                                    color="white"
                                                    onClick={() => delistMachineFiNFT(item.id)}
                                                    disabled={loadSpinner && machineFiNFT.id == item.id ? true : false}> {loadSpinner ? <Spinner /> : null}De list {item.edition}</Button>
                                                    :
                                                    <Button bg="darkslateblue"
                                                        color="white"
                                                        onClick={() => setModalItems2(item, 1)}
                                                        disabled={loadSpinner && machineFiNFT.id == item.id ? true : false}>
                                                        List {item.name}</Button>
                                                }
                                            </div>

                                        </div>
                                    )
                                }) : selectedNFT == 2 ? ([...new Set(displayingNFT)]).map((item, index) => {
                                    return (
                                        <div key={item.id} style={{
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
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {listIotexDomainNFT.includes(item.id) ? <Button bg="red"
                                                    alignSelf={'center'}
                                                    color="white"
                                                    onClick={() => delistIotexDomainNFT(item.id)}
                                                    disabled={loadSpinner && iotexDomainNFT.id == item.id ? true : false}> {loadSpinner ? <Spinner /> : null}De list {item.edition}</Button>
                                                    :
                                                    <Button bg="darkslateblue"
                                                        color="white"
                                                        onClick={() => setModalItems3(item, 1)}
                                                        disabled={loadSpinner && iotexDomainNFT.id == item.id ? true : false}>
                                                        List {item.name}</Button>
                                                }
                                            </div>
                                        </div>
                                    )
                                    //to add more WHITELISTED DOMAINS
                                }) : selectedNFT == 3 ? ([...new Set(displayingNFT)]).map((item, index) => {
                                    return (
                                        <div key={item.id} style={{
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
                                            <h3 style={{ fontSize: 16, marginTop: 15, textAlign: 'center' }}>ID: {item.id}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {listKnowNFTID.includes(item.id) ? <Button bg="red"
                                                    alignSelf={'center'}
                                                    color="white"
                                                    onClick={() => delistKnowToEarnNFT(item.id)}
                                                    disabled={loadSpinner && knowToEarnNFT.id == item.id ? true : false}> {loadSpinner ? <Spinner /> : null}De list {item.edition}</Button>
                                                    :
                                                    <Button bg="darkslateblue"
                                                        color="white"
                                                        onClick={() => setModalItems4(item, 1)}
                                                        disabled={loadSpinner && knowToEarnNFT.id == item.id ? true : false}>
                                                        List {item.name}</Button>
                                                }
                                            </div>
                                        </div>
                                    )
                                    //to add more WHITELISTED DOMAINS
                                }) : null}
                            </Container>
                        </Center>}

                </div>
            </div>
        </div >
    );
});

export default ListforSale;
