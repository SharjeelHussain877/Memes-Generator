import axios from 'axios';
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Container, Card, Col, Row, Image, Button, Form } from 'react-bootstrap';

function useImageDownloader() {
  const [error, setError] = useState(null);

  const downloadImage = async (url, savePath) => {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const blob = new Blob([response.data]);
      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObject;
      link.download = savePath;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError(`Failed to download image from ${url}. Error: ${error.message}`);
    }
  };

  return { downloadImage, error };
}


function App() {

  const { downloadImage, error } = useImageDownloader();
  const [res, setRes] = useState({})
  const [generatedMemes, setGeneratedMemes] = useState({})
  const [selectedMemesId, setSelectedMemesId] = useState("181913649")
  const [currentMemes, setCurrentMemes] = useState({})
  const [memesText, setMemesText] = useState([]);

  async function get() {
    try {
      const response = await axios.get("https://api.imgflip.com/get_memes")
      const result = await response.data.data
      setRes(result)
    } catch (error) {
      console.log(error)
    }
  }



  async function post(memesId, texts) {
    try {
      const textParams = texts.map((text, index) => `text${index}=${encodeURIComponent(text)}`).join('&');

      const response = await axios.post(`https://api.imgflip.com/caption_image?template_id=${memesId}&username=${"sharjeelhussain"}&password=${"Sharjeel@192"}&${textParams}`);
      const result = await response.data;
      setGeneratedMemes(result);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    post(selectedMemesId, memesText)
  }, [selectedMemesId, memesText])

  useEffect(() => {
    get()
  }, [])


  const memesId = (id) => {
    const findMemes = res.memes.find((v) => v.id == id)
    setCurrentMemes(findMemes)
    setSelectedMemesId(id)
    setMemesText([]);
  }


  const handleTextChange = (index, value) => {
    setMemesText((prevText) => {
      const newText = [...prevText];
      newText[index] = value;
      return newText;
    });
  };



  const handleDownload = () => {
    const imageUrl = generatedMemes.data ? generatedMemes.data.url : currentMemes.url;
    const saveLocation = "downloaded_image.jpg";
    downloadImage(imageUrl, saveLocation);
  };



  return (
    <Container style={{ minHeight: "100vh", backgroundColor: "#fff" }} className='py-8'>
      <Row xs={1} md={2} className="g-4">
        <Col >
          <Card>
            {/* <Card.Img variant="top" src="holder.js/100px160" /> */}
            <Card.Body>
              <Card.Title className='text-80px'>{currentMemes && currentMemes.name}</Card.Title>
              <div style={{ width: "100%", minHeight: "auto" }} >
                <Image src={generatedMemes.success ? generatedMemes.data.url : (currentMemes ? currentMemes.url : "https://www.invoicera.com/wp-content/uploads/2023/11/default-image.jpg")}
                  rounded className='w-100 sm:w-auto h-fit sm:h-auto' />
              </div>
              <Card.Text className='flex justify-end'>
                <Button onClick={handleDownload} className="mt-2 bg-[#3e95ff]" as="a" variant="primary">
                  Save memes
                </Button>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card style={{ maxWidth: "100%" }}>
            {/* <Card.Img variant="top" src="holder.js/100px160" /> */}
            <Card.Body>
              <Card.Title className='text-[#3e95ff]'>
                Memes Generator
              </Card.Title>
              <Card.Title className='overflow-hidden'>
                <div className='overflow-x-scroll h-20 flex w-100'>
                  {Array.isArray(res.memes) && res.memes.map(element => (
                    <Image onClick={() => memesId(element.id)} src={element.url} alt="memes-images" className='w-20 mx-2 h-auto' key={element.id} />
                  ))}
                </div>

              </Card.Title>
              <Card.Title>
                {currentMemes && [...Array(currentMemes.box_count)].map((_, index) => (
                  <Form.Control
                    className='mt-2' type="text"
                    placeholder={`Memes text ${index + 1}...`} key={index}
                    value={memesText[index] || ''}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                  />
                ))}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App