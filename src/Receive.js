import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Form, Button, Input } from 'antd';

import config from "./config";
import { decrypt } from "./utils/cryptoHelper";
import cwHelper from "./utils/cwHelper";

const RECIPIENT_MNEMONIC = 'injury census join huge naive salon buyer eight chef cereal income tuna genuine distance reward dice gather lobster essence shaft receive risk stone minor';

function Receive () {
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('free');

  const onFinish = async (values) => {
    requestBox(values.mnemonic);
  };

  const onFinishFailed = (errorInfo) => console.log('Failed:', errorInfo);

  const updateBalance = async () => {
    const balance = await cwHelper.getBalance();
    const { amount, denom } = balance;
    setBalance(`${amount} ${denom}`);
  };

  const requestBox = async (mnemonic) => {
    setStatus('loading');
    await cwHelper.initialize(mnemonic);
    updateBalance();

    const boxGroupId = searchParams.get('boxGroupId');
    const secretKey = searchParams.get('secretKey');

    const data = { viewer: cwHelper.account.address, boxGroupId };
    console.log('data:', data);
    const response = await fetch(`${config.host}/box/get`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(data),
    });
    const responseBody = await response.json();
    console.log('responseBody: ', responseBody);
    
    const { code } = responseBody;
    if (code) {
      setStatusMessage('You have receive the box.');
      return;
    }

    const { data: { boxId, encryptedPassword } } = responseBody;
    const password = decrypt(encryptedPassword, secretKey);
    const result = await cwHelper.openBox(boxId, password);
    console.log('result: ', result);

    setStatusMessage('You opened the box and got funds.');

    updateBalance();
    setStatus('success');
  }

  return (
    <div>
      <h1>Receive box</h1>
      <Form
        name="basic"
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 12 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Mnemonic"
          name="mnemonic"
          rules={[{ required: true, message: 'Please input your mnemonic!' }]}
          initialValue={RECIPIENT_MNEMONIC}
        >
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={status === 'loading'}>
            Sign to Receive
          </Button>
        </Form.Item>
      </Form>

      {statusMessage && (<h1>{statusMessage}</h1>)}
      {balance && <h1>Your Balance: {balance}</h1>}
    </div>
  )
}

export default Receive;