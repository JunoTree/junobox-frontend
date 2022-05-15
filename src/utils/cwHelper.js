import _ from "lodash";
import { makeCosmoshubPath } from "@cosmjs/amino";
import { coins, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, calculateFee, GasPrice } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

const TOKEN_SYMBOL = 'upebble';
const RPC_ENDPOINT = 'https://rpc.cliffnet.cosmwasm.com:443';
const WALLET_PREFIX = 'wasm';
const GAS_LIMIT = 200_000;
const GAS_PRICE = 0.025;
const CONTRACT_ADDRESS = 'wasm1tn2l72qw9a040ptv30sayjrqgkyg0fl5nyc5jmj32eruzqey425qvl7jmz';

class CwHelper {
  constructor() {}

  initialize = async (mnemonic) => {
    // Setup wallet
    const path = makeCosmoshubPath(0);
    this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { hdPaths: [path], prefix: WALLET_PREFIX });

    // Setup account
    const [account] = await this.wallet.getAccounts();
    this.account = account;

     // Setup client
    this.client = await SigningCosmWasmClient.connectWithSigner(RPC_ENDPOINT, this.wallet);

    console.log('CwHelper initialized!');
  }

  getGasPrice = () => GasPrice.fromString(`${GAS_PRICE}${TOKEN_SYMBOL}`);

  getFree = () => calculateFee(GAS_LIMIT, this.getGasPrice());

  transfer = async (recipient, amount, memo) => {
    const amountObj = coins(amount, TOKEN_SYMBOL);
    const fee = this.getFree();
    const result = await this.client.sendTokens(this.account.address,
      recipient,
      amountObj,
      fee,
      memo,
    );
    assertIsDeliverTxSuccess(result);
    console.log("Successfully broadcasted:", result);
  }

  createBoxes = async (boxes) => {
    const createBoxesMessage = {
      create_boxes: { boxes }
    };
    const amount = _.reduce(boxes, (sum, { funds } ) => sum + Number(funds), 0);
    const fee = this.getFree();
    const result = await this.client.execute(this.account.address, CONTRACT_ADDRESS, createBoxesMessage, fee, "", coins(amount, TOKEN_SYMBOL));
    console.log('createBoxes, result: ', result);
    return result;
  }

  openBox = async (boxId, password) => {
    const openBoxMessage = { open_box: { box_id: boxId, password } };
    const fee = this.getFree();
    const result = await this.client.execute(this.account.address, CONTRACT_ADDRESS, openBoxMessage, fee);
    console.log('openBox, result: ', result);
    return result;
  }

  getBalance = () => this.client.getBalance(this.account.address, TOKEN_SYMBOL);
}

export default new CwHelper;
