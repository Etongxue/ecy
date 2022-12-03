import React from 'react';
import { Button, Form, Container, Row, Col, ProgressBar } from 'react-bootstrap';
import { generateImage } from './generate.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploadedImageURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            uploaded: false,
            fp16: 0,
            resize: "none",
            generationStatus: 0,
            updateGenerationProgressInterval: -1,
            bytesUsed: 0
        };
    }

    onUpload = (e) => {
        var input = e.target;
        var reader = new FileReader();
        reader.onload = () => {
            var dataURL = reader.result;
            this.setState({
                uploadedImageURL: dataURL,
                uploaded: true
            });
        };
        reader.readAsDataURL(input.files[0]);
    }

    generate = async () => {
        if (this.state.generationStatus !== 0) {
            return;
        }

        console.log(this.state);
        if (this.state.uploaded === false) {
            alert("请选择一张图片.");
            return;
        }
        if (this.state.resize === "none") {
            alert("请选择压缩大小.");
            return;
        }
        
        window.progress = 0;
        window.bytesUsed = 0;
        let updateGenerationProgressInterval = setInterval(() => {
            this.setState({
                generationProgress: window.progress * 100,
                bytesUsed: window.bytesUsed
            });

            if (this.state.generationStatus !== 1) {
                clearInterval(updateGenerationProgressInterval);
            }
        }, 500);


        this.setState({
            generationStatus: 1,
            updateGenerationProgressInterval: updateGenerationProgressInterval
        });
        let success = false;
        try {
            await generateImage(this.state.resize, this.state.fp16, "uploaded-image", "output");
            success = true;
        } catch (error) {
            alert("Error encountered while generating image: " + error);
            this.setState({
                generationStatus: 0
            });
        }

        if (success) {
            this.setState({
                generationStatus: 2
            });
        }
        
    }
    
    componentWillUnmount = () => {
        if (this.state.updateGenerationProgressInterval !== -1) {
            clearInterval(this.state.updateGenerationProgressInterval);
        }
    }
    
    render () {
        return (
            <div className="app">
                <Container fluid style={{"display": this.state.generationStatus === 0 ? "block" : "none"}}>
                    <Row className="margin">
                        <Col/>
                            <Col xs="12">
                                <h1 style={{"marginBottom": "20px", textAlign: "center"}}>DOKI二次元 <a href="https://tsuki.icu" style={{"fontSize": "12px"}}>H❤️ME</a></h1>
                            </Col>
                        <Col/>
                    </Row>
                    <Row className="margin">
                        <Col/>
                        <Col xs="12" md="8" lg="6">
                            <Form>
                                <Form.File accept="image/*" label={(this.state.uploaded ? "换张图片" : "上传图片")} onChange={this.onUpload} multiple={false} custom />
                            </Form>
                            
                        </Col>
                        <Col/>
                    </Row>
                    <Row className="margin">
                        <Col/>
                        <Col xs="12" md="8" lg="5" xl="4" style={{textAlign: "center", margin: "20px"}}>
                            <img id="uploaded-image" alt="" src={this.state.uploadedImageURL} />
                        </Col>
                        <Col/>
                    </Row>
                    <Row className="margin">
                        <Col/>
                        <Col xs="12" md="8" lg="6" style={{textAlign: "center"}}>
                            <Form>
                                <Form.Group controlId="resize">
                                    <Form.Control defaultValue="none" as="select" onChange={(e) => this.setState({resize: e.target.value})}>
                                        <option value="none" disabled>选择生成大小</option>
                                        <option value="s">小(快)</option>
                                        <option value="m">中</option>
                                        <option value="l">大(慢)</option>
                                        <option value="original">不处理 (可能失败)</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="fp16">
                                    <Form.Control as="select" onChange={(e) => this.setState({fp16: parseInt(e.target.value)})}>
                                        <option value="0">不使用FP16</option>
                                        <option value="1">使用FP16</option>
                                    </Form.Control>
                                </Form.Group>
                                <Button variant="primary" onClick={this.generate}>一键生成</Button>
                            </Form>
                        </Col>
                        <Col/>
                    </Row>
                </Container>

                <div className="overlay" style={{"display": this.state.generationStatus === 1 ? "block" : "none"}}>
                
                    <div style={{"marginTop":"calc( 50vh - 50px )", "height": "100px", "textAlign": "center"}}>
                        <Container fluid>
                            <Row>
                                <Col/>
                                <Col xs="12" md="8" lg="6" style={{textAlign: "center"}}>
                                    <ProgressBar now={this.state.generationProgress} style={{"margin": "10px"}} />
                                    <p>正在进入二次元世界...</p>
                                    <p>大约需要20秒时间，请等待.</p>
                                    <p>M内存 (MB): {this.state.bytesUsed / 1000000} </p>
                                </Col>
                                <Col/>
                            </Row>
                        </Container>
                    </div>
                    
                </div>

                <div className="overlay" style={{"display": this.state.generationStatus === 2 ? "block" : "none"}}>
                    <Container fluid>
                        <Row className="margin">
                            <Col/>
                            <Col xs="12" md="8" lg="5" xl="4" style={{textAlign: "center", margin: "20px"}}>
                                <canvas id="output"></canvas>
                            </Col>
                            <Col/>
                        </Row>
                        <Row className="margin">
                            <Col/>
                            <Col xs="12" md="12" lg="12" xl="10" style={{textAlign: "center", margin: "20px"}}>
                                <p>如果可以的话给个免费的关注吧：公众号【DOKI同学】</p>
                                <Button variant="primary" onClick={() => window.location.reload()}>重新生成</Button>
                            </Col>
                            <Col/>
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}

export default App;
