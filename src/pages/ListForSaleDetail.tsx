import React, { useState, useEffect } from 'react';
import { observer, useLocalStore } from 'mobx-react-lite';
import API from '../common/utils/API';
import erc721 from '@/constants/abi/erc721.json';
import marketplaceABI from '@/constants/abi/marketplace.json';
import { Center, Button, Input, Link as ChakraLink, Spinner, Box } from '@chakra-ui/react';
import { useStore } from '../store/index';
import { StringState, BooleanState } from '../store/standard/base';
import TokenState from '../store/lib/TokenState';
import { BigNumberInputState } from '../store/standard/BigNumberInputState';
import { eventBus } from '../lib/event';
import { BigNumberState } from '../store/standard/BigNumberState';


const ListForSaleDetail = observer(() => {

    const { god, token, lang } = useStore();
    const marketplaceJSON = marketplaceABI;
    const [state, setState] = useState({
        name: '',
        id: ''
    });
    const [loadSpinner, setSpinner] = useState(false)
    const [flag, setFlag] = useState(0);
    const [userPrice, setPrice] = useState(10)
    const [theNFT, setTheNFT] = useState({
        name: '',
        dna: '',
        edition: '',
        image: '',
        attributes: [],
        dividendAmount: '',
        nftStyle: '',
        rankingPercentile: 0,
        mintedDate: ''
    })
    const [loading, setLoading] = useState(false);
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
        eventBus.on('chain.switch', () => {
            theInitialFunction();
        });

    }, []);


    const theInitialFunction = async () => {
        //console.log(god.currentChain.chainId,god.currentChain.Coin)
        //0x2Dd67C90916F79d05487cc0B06bFA9E48B2A8C17 -->old contract
        //0x9756E951dd76e933e34434Db4Ed38964951E588b --> new prod contract
        //0x52fac5db612954db5791d846bd348209f3b39842 
        //0x8b58c2225b92F3B3252B2c5860AC240dCE05172F --> prod test contract
        //0xA221E0118BA902746F198340Fed2305e44F4Fd95 --> dev contract
        const windowUrl = window.location.search;
        const params = new URLSearchParams(windowUrl);
        setState({
            name: newToken.name,
            id: params.get('id')
        })
        getItem(params.get('id'))
       
        setLoading(false)
        
    }
    const listItemForSale = async () => {
        
        //marketplace-address: 0x4A115815028777F94ad07e20eED7C2ABcCa99730
        if(flag==0){
            try {
                let theApproval = await god.currentNetwork.execContract({
                    address: "0x9756E951dd76e933e34434Db4Ed38964951E588b",
                    abi: erc721,
                    method: "setApprovalForAll",
                    params:["0x8b58c2225b92F3B3252B2c5860AC240dCE05172F",true]
                    //params: ["0x8b58c2225b92F3B3252B2c5860AC240dCE05172F", Number(theNFT.edition)]
                })
                setSpinner(true)
                let theReceipt = await theApproval.wait(); // to get the wait done
                if(theReceipt.status==1){
                    setSpinner(false)
                    setFlag(1)
                }
            }
            catch (e) {
                console.log(e)
            }
        }
        var listAmount = userPrice + '0'.repeat(18);
        if (flag == 1) {
            try {
                let theAddress = await god.currentNetwork.execContract({
                    address: "0x8b58c2225b92F3B3252B2c5860AC240dCE05172F",
                    abi: marketplaceJSON,
                    method: "createMarketItem",
                    params: [
                        "0x9756E951dd76e933e34434Db4Ed38964951E588b",
                        theNFT.edition,
                        listAmount,
                        "100000000000000000000"
                    ]
                })
                let theReceipt = await theAddress.wait(); // to get the wait done
                if(theReceipt.status==1){
                    setSpinner(false)
                    setFlag(1)
                }
                setSpinner(true)
                console.log(theAddress)
                setSpinner(false)
            }
            catch (e) {
                console.log(e)
            }
        }
    }

    const getItem = async (item) => {
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
            setTheNFT(
                {
                    name: theItem.name,
                    dna: theItem.dna,
                    edition: theItem.edition,
                    image: stringImage,
                    attributes: theItem.attributes,
                    dividendAmount: String(rarity.dividend),
                    nftStyle: rarity.type,
                    rankingPercentile: (Number(rarity.ranking)),
                    mintedDate: theDate
                }
            )
            setLoading(false)
        }).catch(error => {
            console.log(error)
        })
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

    return (
        <div>
            <div style={{ paddingLeft: 50, margin: 10, width: '100%' }}>
                <Box style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: "wrap",
                    flexDirection: 'row', minHeight: 30
                }}>

                </Box>
            </div>
            <div >
                <div>
                    {!god.currentNetwork.account ? <Center>Wallet not connected</Center> : loading ? <Center>Loading</Center> :
                        <Box m="5" borderWidth='3px' borderRadius='lg' style={{ display: "flex", flexDirection: "row" }}>
                            <Box style={{
                                margin: 10,
                                padding: 5,
                                paddingLeft: 30,
                                justifyContent: 'left',
                                justifyItems: 'left',
                                display: 'flex',
                                flexWrap: "wrap",
                                flexDirection: 'column',
                                maxWidth: '100%'
                            }}>
                                <img src={theNFT.image} style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }} height={60} />
                                <p style={{ fontWeight: 'bold', padding: 10 }}>{theNFT.name}</p>
                                <p style={{ fontWeight: 'bold', padding: 10 }}>ID: {theNFT.edition}</p>
                                <p style={{ fontWeight: 'bold', padding: 10 }}>Dividend: {theNFT.dividendAmount}%</p>
                            </Box>
                            <Box style={{ padding: 20 }}>
                                <p style={{ fontWeight: 'bold', marginBottom: 10 }}>List {theNFT.name} for sale</p>
                                Price <Input value={userPrice} onChange={e => setPrice(Number(e.target.value))} color='teal' placeholder='IOTEX' variant='outline' type="number" />

                                <Button onClick={() => listItemForSale()} mt="5" bg="lightgreen">{loadSpinner ? <Spinner /> : null}{flag == 0 ? "Approve Item for Sale" : "List Item for SALE"}</Button>
                            </Box>
                        </Box>}
                </div>
            </div>
        </div >
    );
});

export default ListForSaleDetail;
