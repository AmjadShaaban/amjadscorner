import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FaEthereum, FaReact, FaBootstrap } from 'react-icons/fa';
import { SiSolidity } from 'react-icons/si';
import abi from '../utils/WavePortal.json';
import { WaveCard } from '../components/wave-card';

interface Wave {
  from?: string;
  waver?: string;
  address?: string;
  message: string;
  timestamp: Date;
}

const Dapp = () => {
  const [currentAccount, setCurrentAccount] = useState('');

  const [allWaves, setAllWaves] = useState<Wave[]>([]);

  const [waveMessage, setWaveMessage] = useState('');

  const contractAddress = '0x7ac60BBEfFa71f14663185627477cdf7f2DAc8Af';

  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = waves.map((wave: Wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(parseInt(wave.timestamp.toString()) * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract: any;

    const onNewWave = (from: string, timestamp: number, message: string) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if ((window as any).ethereum) {
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();
      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on('NewWave', onNewWave);
    }
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        console.log('Make sure you have MetaMask');
      } else {
        console.log('We have the ethereum object', ethereum);
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllWaves();
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async (waveMessage: any) => {
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());

        const waveTxn = await wavePortalContract.wave(waveMessage, {
          gasLimit: 300000,
        });
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <Container fluid className='bg-dark'>
      <Navbar variant='dark'>
        <Navbar.Brand>DAPP</Navbar.Brand>
        <Nav className='me-auto'>
          <Nav.Link href='http://amjadscorner.us'>Home</Nav.Link>
          <NavDropdown title='Projects' id='navbarScrollingDropdown'>
            <NavDropdown.Item href='#action1'>
              [PH]Project 2 name
            </NavDropdown.Item>
            <NavDropdown.Item href='#action2'>
              [PH]Project 3 name
            </NavDropdown.Item>
            <NavDropdown.Item href='#action3'>
              [PH]Project 4 name
            </NavDropdown.Item>
            <NavDropdown.Item href='#action4'>
              [PH]Project 5 name
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href='#action5'>[PH]</NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href='#contact'>Contact me!</Nav.Link>
        </Nav>
      </Navbar>
      <p className='text-center text-light fs-1'>Welcome to my first DAPP!</p>
      <p className='text-center text-light fs-3'>
        A Web3 app with <SiSolidity size={32} />
        Solidity + <FaEthereum size={32} />
        Ethereum smart contract built in <FaReact size={32} /> React +{' '}
        <FaBootstrap size={32} /> Bootstrap
      </p>
      <p className='text-body text-muted text-center fs-6'>
        Deployed on Rinkeby Test Network!. Wave at me, send a message and you
        might be one of the lucky prize winners!
      </p>
      {!currentAccount && (
        <Button variant='success' onClick={connectWallet}>
          Connect to Wallet 💰
        </Button>
      )}
      <Container className='d-flex justify-content-center text-center'>
        <Form style={{ width: '24rem' }}>
          <Form.Group className='mb-3' controlId='waveMessageForm'>
            <Form.Label>Message</Form.Label>
            <Form.Control
              type='text'
              className='text-info'
              placeholder='Enter your message'
              onChange={(e) => {
                setWaveMessage(e.target.value);
              }}
            />
            <Form.Text className='text-muted'>
              Send a message with your Wave.
            </Form.Text>
          </Form.Group>
          <Button
            variant='secondary'
            type='submit'
            onClick={(e) => {
              e.preventDefault();
              wave(waveMessage);
            }}
          >
            Send a Wave 👋
          </Button>
        </Form>
      </Container>
      <Row>
        {allWaves.map((wave, index) => {
          return (
            <Col>
              <WaveCard key={index} wave={wave} />
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default Dapp;
