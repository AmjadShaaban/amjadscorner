import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
import { FaEthereum, FaReact, FaBootstrap } from 'react-icons/fa';
import { SiSolidity } from 'react-icons/si';
import abi from '../utils/WavePortal.json';

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
    <>
      <Navbar bg='dark' variant='dark'>
        <Container>
          <Navbar.Brand>DAPP</Navbar.Brand>
          <Nav className='me-auto'>
            <Nav.Link href='http://amjadscorner.us'>Home</Nav.Link>
            <NavDropdown title='Projects' id='navbarScrollingDropdown'>
              <NavDropdown.Item href='#action3'>
                Project 2 name
              </NavDropdown.Item>
              <NavDropdown.Item href='#action4'>
                Project 3 name
              </NavDropdown.Item>
              <NavDropdown.Item href='#action4'>
                Project 4 name
              </NavDropdown.Item>
              <NavDropdown.Item href='#action4'>
                Project 5 name
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href='#action5'>[PH]</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href='#pricing'>Contact me!</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container fluid>
        Welcome to my first DAPP!
        <p>
          A Web3 app with <SiSolidity size={36} />
          Solidity + <FaEthereum size={36} />
          Ethereum smart contract built in <FaReact size={36} />
          React + <FaBootstrap size={36} />
          Bootstrap
        </p>
        <p>
          Deployed on Rinkeby Test Network!. Wave at me, send a message and you
          might be one of the lucky prize winners!
        </p>
      </Container>
      {!currentAccount && (
        <Button variant='success' onClick={connectWallet}>
          CONNECT TO ACCOUNT
        </Button>
      )}
      <Form>
        <Form.Group className='mb-3' controlId='waveMessageForm'>
          <Form.Label>Message</Form.Label>
          <Form.Control
            type='text'
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
          Submit
        </Button>
      </Form>

      {allWaves.map((wave, index) => {
        return (
          <Card bg='dark' key={index} style={{ width: '18rem' }}>
            <Card.Header>From: {wave.address}</Card.Header>
            <Card.Body>{wave.message}</Card.Body>
            <Card.Footer>
              <small className='text-muted'>
                On: {wave.timestamp.toString()}
              </small>
            </Card.Footer>
          </Card>
        );
      })}
    </>
  );
};

export default Dapp;
