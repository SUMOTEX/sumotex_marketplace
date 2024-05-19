import React, { useState, useEffect } from 'react';
import { observer, useLocalStore } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import API from '../common/utils/API';
import marketplaceABI from '@/constants/abi/marketplace.json';
import buyBackABI from '@/constants/abi/buyBack.json';
import xSUMOABI from '@/constants/abi/xsumo.json';
import erc721 from '@/constants/abi/erc721.json';
import {
    Center, Flex, Box, Spinner, Button, Accordion,
    Thead,
} from '@chakra-ui/react';
import { useStore } from '../store/index';
import { StringState, BooleanState } from '../store/standard/base';
import TokenState from '../store/lib/TokenState';
import { BigNumberInputState } from '../store/standard/BigNumberInputState';
import { BigNumberState } from '../store/standard/BigNumberState';
import 'reactjs-popup/dist/index.css';
import axios from 'axios';
import _ from 'lodash';

const BuyBackPage = observer(() => {
    const { god, token, lang } = useStore(); 222222
    const [loadSpinner, setSpinner] = useState(false)
    const [state, setState] = useState({
        name: '',
        currentMinted: 0
    });
    const [selectedNFT, setSelectedNFT] = useState(0);
    const [xsumo, setXSumo] = useState([]);
    const [sesumo, setSESumo] = useState([]);
    const [selectedSUMO, setSelected] = useState(0);
    const [userHasNFT, setUseHasNFT] = useState(false)
    const [flag, setFlag] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalNFT, setTotalNFT] = useState(0);
    const [totalXSUMONFT, setTotalXSUMONFT] = useState(0);
    const [refreshPage, setRefreshPage] = useState(false)

    const [displayingNFT, setDisplayNFT] = useState([])
    //check listed sumo and itemID
    //check listed xsumo and itemID
    const [listxSumoNFT, setXListedID] = useState([])
    //all emperor traits filter
    //type of NFT
    //0 - SUMO
    //1 - MachinFI
    const newToken = new TokenState({
        abi: erc721,
        symbol: 'SUMOTEX',
        name: 'SUMOTEX',
        address: '0x9756e951dd76e933e34434db4ed38964951e588b',
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
        setDisplayNFT([])
        setXListedID([]);
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
        getSESUMONFT();
        listXSUMONFT();

    }
    const listXSUMONFT = async () => {
        let xSUMOBalance = await god.currentNetwork.execContract({
            address: '0x7D150D3eb3aD7aB752dF259c94A8aB98d700FC00',
            abi: xSUMOABI,
            method: "balanceOf",
            params: [god.currentNetwork.account]
        })
        setTotalXSUMONFT(Number(xSUMOBalance));
        for (var i = 0; i < Number(xSUMOBalance); i++) {
            let xSumoBalanceArray = await god.currentNetwork.execContract({
                address: '0x7D150D3eb3aD7aB752dF259c94A8aB98d700FC00',
                abi: xSUMOABI,
                method: "tokenOfOwnerByIndex",
                //params: ['0xa3ea7015e5b16595bf3751f03f3c7425002ffcdb', i]
                params: [god.currentNetwork.account, i]
            })
            getXSUMONFT(Number(xSumoBalanceArray));
        }

    }
    const getSESUMONFT = async () => {
        try {
            let theAddress = await god.currentNetwork.execContract({
                address: "0x9756e951dd76e933e34434db4ed38964951e588b",
                abi: newToken.abi,
                method: "walletOfOwner",
                params: [god.currentNetwork.account]
            })
            if (theAddress instanceof Array) {
                setTotalNFT(theAddress.length)
                var numberArray = [...theAddress]
                filterNFTs(numberArray)
                setLoading(false)
            }
        }
        catch (e) {
            console.log(e)
        }
    }
    const nextNFT = () => {
        if (selectedNFT == 0) {
            if (selectedSUMO < totalNFT - 1) {
                setSelected(selectedSUMO + 1);
            }
        } else {
            if (selectedSUMO < totalXSUMONFT - 1) {
                setSelected(selectedSUMO + 1);
            }
        }
    }

    const beforeNFT = () => {
        if (selectedNFT == 0) {
            if (selectedSUMO > 0) {
                setSelected(selectedSUMO - 1);
            }
        } else {
            if (selectedSUMO > 0) {
                setSelected(selectedSUMO - 1);
            }
        }
    }
    const changeNFT = (selectedNFT) => {
        if (selectedNFT == 0) {
            setSelectedNFT(0)
        } else {
            setSelectedNFT(1)
        }


    }
    const calculateXSUMORarity = (items) => {
        var avg = 10
        var theAvg = 0
        var theDividend = 0
        var theAttributes = []
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
                setSESumo(prevState => ([
                    ...prevState,
                    {
                        name: theItem.name,
                        dna: theItem.dna,
                        rewards: rarity.dividend == 25 ? '50' : rarity.dividend == 15 ? '6' : rarity.dividend == 12 ? '4' : rarity.dividend == 7 ? '2' : '1',
                        edition: theItem.edition,
                        image: stringImage,
                        attributes: theItem.attributes,
                        dividendAmount: rarity.dividend,
                        nftStyle: rarity.type,
                        rankingPercentile: (Number(rarity.ranking)),
                    }
                ]))

            }).catch(error => {
                console.log(error)
            })
        });
    }
    const getXSUMONFT = async (xSumoNFTArray) => {
        if (xSumoNFTArray >= 11) {
            let details = await god.currentNetwork.execContract(
                {
                    address: '0x7d150d3eb3ad7ab752df259c94a8ab98d700fc00',
                    abi: xSUMOABI,
                    method: 'tokenURI',
                    params: [String(xSumoNFTArray)]
                })
            //@ts-ignore
            let theItem = details.replace("ipfs://", "https://sumotex.mypinata.cloud/ipfs/")
            API.get(theItem).then(res => {
                var theItemsNFT = res.data
                let theImage = (theItemsNFT['image']).replace("ipfs://", "https://sumotex.mypinata.cloud/ipfs/")
                var rarity = calculateXSUMORarity(theItemsNFT.attributes)
                setXSumo(prevState => ([
                    ...prevState,
                    {
                        name: Number(xSumoNFTArray) <= 10 ? theItemsNFT.name : "XSUMO #" + Number(xSumoNFTArray),
                        dna: theItemsNFT.dna,
                        rewards: Number(xSumoNFTArray) <= 10 ? '80' : rarity.dividend == 25 ? '50' : rarity.dividend == 15 ? '6' : rarity.dividend == 12 ? '4' : rarity.dividend == 7 ? '2' : '1',
                        edition: Number(xSumoNFTArray),
                        image: theImage,
                        attributes: theItemsNFT.attributes,
                        nftStyle: Number(xSumoNFTArray) <= 10 ? 'Giga' : rarity.type,
                        rankingPercentile: Number(xSumoNFTArray) <= 10 ? '1%' : (Number(rarity.ranking)),
                    }
                ]))
            })
        } else {
            let details = await god.currentNetwork.execContract(
                {
                    address: '0x7d150d3eb3ad7ab752df259c94a8ab98d700fc00',
                    abi: xSUMOABI,
                    method: 'tokenURI',
                    params: [String(xSumoNFTArray)]
                })
            //@ts-ignore
            let theItem = details.replace("ipfs://", "https://sumotex.mypinata.cloud/ipfs/")
            API.get(theItem).then(res => {
                var theItemsNFT = res.data
                let theImage = (theItemsNFT['image']).replace("ipfs://", "https://sumotex.mypinata.cloud/ipfs/")

                setXSumo(prevState => ([
                    ...prevState,
                    {
                        name: Number(xSumoNFTArray) <= 10 ? theItemsNFT.name : "XSUMO #" + Number(xSumoNFTArray),
                        dna: theItemsNFT.dna,
                        rewards: 80,
                        edition: Number(xSumoNFTArray),
                        image: theImage,
                        attributes: theItemsNFT.attributes,
                        nftStyle: 'Giga',
                        rankingPercentile: '1%'
                    }
                ]))
            })
        }
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

        if (theDividend === 25) {
            return { dividend: 25, type: 'Emperor' }
        }
        else if (theDividend === 15) {
            return { dividend: 15, type: 'King' }
        }
        else if (theDividend === 12) {
            return { dividend: 12, type: 'Knight' }
        }
        else if (theDividend === 7) {
            return { dividend: 7, type: 'Soldier' }
        }
        else if (theDividend === 1) {
            return { dividend: 1, type: 'Minion' }
        }
        else return { dividend: 'error', ranking: 'error' }
    }
    const buyBackSENFT = async () => {
        if (flag == 0) {
            setSpinner(true)
            try {
                let theApproval = await god.currentNetwork.execContract({
                    address: "0x9756E951dd76e933e34434Db4Ed38964951E588b",
                    abi: erc721,
                    method: "setApprovalForAll",
                    params: ["0x5f51c5afb1aa9c3d6144af77b12fa645cfd513d0", true]
                    //params: ["0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee", Number(theNFT.edition)]
                })

                let theReceipt = await theApproval.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    let approvalStatus = await god.currentNetwork.execContract({
                        address: "0x9756E951dd76e933e34434Db4Ed38964951E588b",
                        abi: erc721,
                        method: "isApprovedForAll",
                        params: [god.currentNetwork.account, "0x5f51c5afb1aa9c3d6144af77b12fa645cfd513d0"]
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
            try {
                let theAddress = await god.currentNetwork.execContract({
                    address: "0x5f51c5afb1aa9c3d6144af77b12fa645cfd513d0",
                    abi: buyBackABI,
                    method: "buyBackSENFT",
                    params: [sesumo[selectedSUMO].edition]
                })

                let theReceipt = await theAddress.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    setSpinner(false)
                    setFlag(0)

                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
    }
    const buyBackXNFT = async () => {
        if (flag == 0) {
            setSpinner(true)
            try {
                let theApproval = await god.currentNetwork.execContract({
                    address: "0x7d150d3eb3ad7ab752df259c94a8ab98d700fc00",
                    abi: erc721,
                    method: "setApprovalForAll",
                    params: ["0x5f51c5afb1aa9c3d6144af77b12fa645cfd513d0", true]
                    //params: ["0x504f53a0fb4e43a6370116E0Aed2408a8b0513Ee", Number(theNFT.edition)]
                })

                let theReceipt = await theApproval.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    let approvalStatus = await god.currentNetwork.execContract({
                        address: "0x7d150d3eb3ad7ab752df259c94a8ab98d700fc00",
                        abi: erc721,
                        method: "isApprovedForAll",
                        params: [god.currentNetwork.account, "0x5f51c5afb1aa9c3d6144af77b12fa645cfd513d0"]
                    })
                    //@ts-ignore
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
                let theAddress = await god.currentNetwork.execContract({
                    address: "0x5f51c5afb1aa9c3d6144af77b12fa645cfd513d0",
                    abi: buyBackABI,
                    method: "buyBackXNFT",
                    params: [xsumo[selectedSUMO].edition]
                })

                let theReceipt = await theAddress.wait(); // to get the wait done
                if (theReceipt.status == 1) {
                    setSpinner(false)
                    setFlag(0)

                }
            }
            catch (e) {
                setSpinner(false)
                toast.error(String(e.message))
                console.log(e)
            }
        }
    }
    return (
        <Center>
            <h2>Sold out, thanks, please do wait for the next batch on the 19th same day.</h2>
        </Center>
        // <Center style={{ margin: 2 }}>
        //     {!god.isConnect ? <div>Wallet not connected</div> : <Box mt={2} m={1} flexShrink={'inherit'} border="1px" borderRadius={6} padding={5}>
        //         <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>SUMOTEX BUY BACK PROGRAM</div>
        //         <div style={{ textAlign: 'center', padding: 5, alignItems: 'center' }}>
        //             {sesumo.length == 0 ? null : <Button
        //                 type="button" onClick={() => changeNFT(0)}>
        //                 SE SUMO
        //             </Button>}
        //             {xsumo.length == 0 ? null : <Button
        //                 type="button" onClick={() => changeNFT(1)}>
        //                 XSUMO
        //             </Button>}
        //         </div>
        //         {selectedNFT == 0 ?
        //             sesumo.length > 0 ?
        //                 <Box style={{
        //                     margin: 5,
        //                     padding: 5,
        //                     justifyContent: 'center',
        //                     justifyItems: 'center',
        //                     display: 'flex',
        //                     flexWrap: "wrap",
        //                     flexDirection: 'column',
        //                     maxWidth: '100%'
        //                 }}>
        //                     <h3 style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>{sesumo[selectedSUMO].name}</h3>
        //                     <img src={sesumo[selectedSUMO].image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={250} />
        //                     <p style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>ID: {sesumo[selectedSUMO].edition}</p>
        //                     <p style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', padding: 5 }}>APY: {sesumo[selectedSUMO].dividendAmount}%</p>
        //                 </Box> : null
        //             :
        //             xsumo.length > 0 ?
        //                 <Box style={{
        //                     margin: 5,
        //                     padding: 5,
        //                     justifyContent: 'center',
        //                     justifyItems: 'center',
        //                     display: 'flex',
        //                     flexWrap: "wrap",
        //                     flexDirection: 'column',
        //                     maxWidth: '100%'
        //                 }}>
        //                     <h3 style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>{xsumo[selectedSUMO].name}</h3>
        //                     <img src={xsumo[selectedSUMO].image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} width={250} />
        //                     <p style={{ textAlign: 'center', fontWeight: 'bold', padding: 5 }}>ID: {xsumo[selectedSUMO].edition}</p>
        //                     <p style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', padding: 5 }}>APY: {xsumo[selectedSUMO].dividendAmount}%</p>
        //                 </Box> : null
        //         }
        //         <Flex justify="space-around">
        //             <Button
        //                 type="button" onClick={() => beforeNFT()}>
        //                 Previous
        //             </Button>
        //             <Button
        //                 type="button" onClick={() => nextNFT()}>
        //                 Next
        //             </Button>
        //         </Flex>
        //         <Flex justify="space-around" p={2}>
        //             <Button
        //                 mt="4"
        //                 type="button" onClick={() => selectedNFT == 0 ? buyBackSENFT() : buyBackXNFT()}>
        //                 {loadSpinner ? <Spinner /> : null}  {flag == 0 ? 'Approve' : 'SELL'}
        //             </Button>
        //         </Flex>
        //         <Flex justify="space-around" p={2}>
        //             <Button type="button" mt="4" disabled={!store.state.valid}
        //             >
        //                 {store.state.msg}
        //             </Button>
        //             {store.state.valid && god.isConnect && (
        //                 <Button type="button" mt="4" disabled={!store.state.valid}
        //                 >
        //                     {store.state.msgApprove}
        //                 </Button>
        //             )}
        //         </Flex>
        //         <p style={{ textAlign: 'center', fontSize: 14, marginTop: 10 }}>
        //             Contract Address: 0x5f51c5afb1aa9c3d6144af77b12fa645cfd513d0
        //         </p>
        //         <p style={{ textAlign: 'center', fontSize: 14, marginTop: 0 }}>
        //             XSUMO NFT: 2,100 IOTEX per NFT
        //         </p>
        //         <p style={{ textAlign: 'center', fontSize: 14, marginTop: 0 }}>
        //             SE SUMO NFT: 1,575 IOTEX per NFT
        //         </p>
        //         <p style={{ textAlign: 'center', fontSize: 12, marginTop: 15 }}>
        //             * First month (December 2023) allocation for repurchase are 20 units of SE-SUMO and 20 units of X-SUMO. <br />
        //             * Subsequent month allocation thereafter allocation will be 7 SE-SUMO and 7 X-SUMO <br /> (Amount will vary- increase/decrease depending on market conditions)
        //         </p>
        //     </Box>}
        // </Center>
    );
});

export default BuyBackPage;
