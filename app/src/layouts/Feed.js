import React, { Component }from "react"
import ListFeed from '../components/ListFeed'
import Contracts from "../services/contracts"
import { Form, TextArea, Button } from 'semantic-ui-react'
const { web3 } = window

class Feed extends Component {

    state = {
        username: '',
        isLoading: false,
        message: '',
        posts: []
    }

    items = []
    countLoop = 0
    totalPost = false

    componentDidMount() {
        Contracts.setNetwork('1234567')
        this.social = Contracts.Social()
        this.social.getUsername((err, response) => {
            const username = web3.toAscii(response)
            if (!err && username.length > 0) {
                console.log(username)
                this.setState({username})
            }
        })

        this.social.getTotalPost((err, response) => {
            if (!err) {
                this.items = []
                this.countLoop = 0
                this.totalPost = response.c[0]
                for(let i=0; i<this.totalPost; i++) {
                    this.social.listPosts(i, (err, response) => {
                        if (!err) this.setItem(response)
                        this.countLoop++
                    })
                }
            }
        })
        this.social.NewPost().watch(this.onNewPost)
    }

    createModelPost = (postId, message, hashImage, address) => {
        return {
            postId: postId,
            message: message,
            hashImage: hashImage,
            address: address
        }
    }

    setItem = (item) => {
        const model = this.createModelPost(item[0], item[1], item[2], item[3])
        this.items.push(model)
        if (this.countLoop === this.totalPost - 1) {
            this.setState({posts: this.items})
        }
    }

    onNewPost = (err, response) => {
        if (!err) {
            const {id, hashImage, message, owner} = response.args
            const model = this.createModelPost(id, message, hashImage, owner)
            this.items.push(model)
            this.setState({posts: this.items})
        }
    }

    onPost = () => {
        const message = this.state.message
        const hashImage = ''
        this.social.post(message, hashImage, (err, response) => {
            this.setState({message:''})
        })
    }

    onTextChange = (event) => {
        this.setState({message: event.target.value})
    }

    render() {
        return(
            <div>
                <div style={{display: 'flex', width: '100vw', height: '100vh'}}>
                    <div style={{width: '40%', height: '100%', display:'flex', textAlign: 'center', alignItems: 'center', justifyContent:'center', flexDirection: 'column'}}>
                        <div style={{width: '100%'}}>
                            <div style={{margin: '36px'}}>
                                <h2>Hi... {this.state.username}</h2>
                                <Form onSubmit={this.onPost}>
                                    <TextArea autoHeight placeholder='Tryping Message' onChange={this.onTextChange} value={this.state.message}/>
                                </Form>
                                <Button style={{
                                    margin: '26px',
                                    width: '50%'
                                }} primary loading={this.state.isLoading} onClick={this.onPost}>Post</Button>
                            </div>
                        </div>
                    </div>
                    <div style={{width: '60%'}}>
                        <ListFeed items={this.state.posts}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Feed