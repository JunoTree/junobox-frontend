import _ from 'lodash';
import React, { useState } from 'react';
import { Form, Button, Input } from 'antd';
import { v4 } from 'uuid'; 
import cryptoRandomString from 'crypto-random-string';
import { Link } from "react-router-dom";

import cwHelper from './utils/cwHelper';
import { encrypt, sha256 } from './utils/cryptoHelper';
import config from './config';

const TEST_MNEMONIC = 'boy hand december junior picnic seminar slush chat toy labor connect year wide keen mixture cousin buddy grocery quality ring wing olympic badge seven';

function Create () {
  const [secretKey, setSecretKey] = useState();
  const [boxGroupId, setBoxGroupId] = useState();
  const [status, setStatus] = useState('free');

	const onFinish = async (values) => {
    setStatus('loading');
    await cwHelper.initialize(values.mnemonic);
    const boxes = [];
    for(let i = 0; i < 3; i += 1) {
      boxes.push({ funds: "1000000", password: v4() });
    }

    const contractParams = _.map(boxes, ({funds, password}) => ({
      funds,
      hashed_password: sha256(password),
    }));

    const contractResult = await cwHelper.createBoxes(contractParams);
    const { logs: [ { events } ] } = contractResult;
    const event = events[events.length - 1];
    const { attributes } = event;
    const attribute = _.find(attributes, ({key}) => key === 'box_ids' );
    const { value: boxIds } = attribute;
    const newBoxIds = _.map(_.split(boxIds, ','), value => Number(value));
    _.each(boxes, (box, index) => box.boxId = newBoxIds[index]);
    
    const secretKey = cryptoRandomString({length: 8});
    setSecretKey(secretKey);

    const boxesData = _.map(boxes, ({boxId, funds, password}) => ({
      boxId,
      funds,
      encryptedPassword: encrypt(password, secretKey),
    }));

    const data = {
      creator: cwHelper.account.address,
      boxes: boxesData,
    };

    const response = await fetch(`${config.host}/box/create`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(data),
    });
    const responseBody = await response.json();
    const { data: { boxGroupId: newBoxGroupId} } = responseBody;
    setBoxGroupId(newBoxGroupId);

    setStatus('success');
  };

  const onFinishFailed = (errorInfo) => console.log('Failed:', errorInfo);

	return (
		<div>
      <h1>Create box</h1>
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
          initialValue={TEST_MNEMONIC}
        >
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={status === 'loading'}>
            Sign to Create
          </Button>
        </Form.Item>
      </Form>
      {boxGroupId && secretKey && (<h1><Link to={`/receive?boxGroupId=${boxGroupId}&secretKey=${secretKey}`}>Check here to receive box</Link></h1>)}
		</div>
	)
}

export default Create;
