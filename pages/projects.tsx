import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import {
  Navbar,
  Container,
  Nav,
  Carousel,
  Card,
  Row,
  Col,
  Accordion,
} from 'react-bootstrap';

const projects = [
  {
    title: 'PROJECT TITLE',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis vel aut id et! Beatae, natus consequatur ullam doloremque nulla perferendis ipsa repudiandae labore aperiam et? Illo dolorum maxime excepturi. Placeat?',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'PROJECT TITLE',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis vel aut id et! Beatae, natus consequatur ullam doloremque nulla perferendis ipsa repudiandae labore aperiam et? Illo dolorum maxime excepturi. Placeat?',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'PROJECT TITLE',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis vel aut id et! Beatae, natus consequatur ullam doloremque nulla perferendis ipsa repudiandae labore aperiam et? Illo dolorum maxime excepturi. Placeat?',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'PROJECT TITLE',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis vel aut id et! Beatae, natus consequatur ullam doloremque nulla perferendis ipsa repudiandae labore aperiam et? Illo dolorum maxime excepturi. Placeat?',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'PROJECT TITLE',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis vel aut id et! Beatae, natus consequatur ullam doloremque nulla perferendis ipsa repudiandae labore aperiam et? Illo dolorum maxime excepturi. Placeat?',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'PROJECT TITLE',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis vel aut id et! Beatae, natus consequatur ullam doloremque nulla perferendis ipsa repudiandae labore aperiam et? Illo dolorum maxime excepturi. Placeat?',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'PROJECT TITLE',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis vel aut id et! Beatae, natus consequatur ullam doloremque nulla perferendis ipsa repudiandae labore aperiam et? Illo dolorum maxime excepturi. Placeat?',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'PROJECT TITLE',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis vel aut id et! Beatae, natus consequatur ullam doloremque nulla perferendis ipsa repudiandae labore aperiam et? Illo dolorum maxime excepturi. Placeat?',
    text2: 'Last updated 3 mins ago',
  },
];

const Portfolio: NextPage = () => {
  // const [projects, setProjects] = useState([]);

  return (
    <Container fluid className='bg-dark'>
      <Navbar bg='dark' variant='dark'>
        <Navbar.Brand href='#home'>Navbar</Navbar.Brand>
        <Nav className='me-auto'>
          <Nav.Link href='/'>Home</Nav.Link>
          <Nav.Link href='#[PH]'>[PH]</Nav.Link>
          <Nav.Link href='#contact'>Contact</Nav.Link>
        </Nav>
      </Navbar>
      <h2 className='text-light text-center'>Featured Work</h2>
      <div className='d-flex align-items-center justify-content-center'>
        <Carousel variant='dark' style={{ width: '64rem' }}>
          <Carousel.Item>
            <img
              className='d-block w-100'
              src='/800x400.png'
              alt='First slide'
            />
            <Carousel.Caption>
              <h5>First slide label</h5>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className='d-block w-100'
              src='/800x400.png'
              alt='Second slide'
            />
            <Carousel.Caption>
              <h5>Second slide label</h5>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className='d-block w-100'
              src='/800x400.png'
              alt='Third slide'
            />
            <Carousel.Caption>
              <h5>Third slide label</h5>
              <p>
                Praesent commodo cursus magna, vel scelerisque nisl consectetur.
              </p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>

      <h3 className='text-light text-center'>My Work</h3>
      {Array.isArray(projects) &&
        projects?.map((project, idx) => (
          <Accordion key={idx} style={{ width: '24rem' }}>
            <Accordion.Item eventKey={idx.toString()}>
              <Accordion.Header>{project.title}</Accordion.Header>
              <Accordion.Body>{project.text}</Accordion.Body>
            </Accordion.Item>
          </Accordion>
        ))}
    </Container>
  );
};

export default Portfolio;
