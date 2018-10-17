import React, { Component }from "react"
import ListFeed from '../components/ListFeed'
import Contracts from "../services/contracts"
import { Form, TextArea, Button, Message } from 'semantic-ui-react'
const { web3 } = window

class Feed extends Component {

    state = {
        username: '',
        isLoading: false,
        message: '',
        posts: [],
        errorMessage: '',
        myAddress: '',
        balance: 0
    }

    items = []
    countLoop = 0
    totalPost = false

    componentDidMount() {
        Contracts.setNetwork('1234567')
        // Contracts.setNetwork('4')
        this.social = Contracts.Social()

        this.setState({myAddress: web3.eth.defaultAccount})
        this.getBalance(web3.eth.defaultAccount)

        this.social.getUsername((err, response) => {
            if (!err) {
                const username = web3.toAscii(response).replace(/\u0000/g, '')
                if (username.length > 0) {
                    this.setState({username})
                } else {
                    this.props.history.replace('/')    
                }
            } else {
                this.props.history.replace('/')
            }
        })

        this.social.getTotalPost((err, response) => {
            if (!err) {
                this.items = []
                this.countLoop = 0
                this.totalPost = response.c[0]
                for(let i= this.totalPost-1; i>= 0; i--) {
                    this.social.listPosts(i, (err, response) => {
                        if (!err) this.setItem(response)
                        this.countLoop++
                    })
                }
            }
        })
    }

    getBalance = (address) => {
        web3.eth.getBalance(address, (err, balance) => {
            if (!err) this.setState({ balance })
        })
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
            this.items.splice(0, 0, model)
            this.setState({posts: this.items, isLoading: false})
            this.getBalance(response.args.owner)
        } else {
            this.setState({errorMessage: err.message, isLoading: false})
        }
    }

    onNewBalance = (err, response) => {
        if (!err) {
            this.getBalance(response.args.owner)
            // TODO: call function checkPermission from contract
        } else {
            // TODO: something can't get balance
        }
    }

    onPost = () => {
        const message = this.state.message
        const hashImage = ''
        this.setState({isLoading: true})
        this.social.NewPost().watch(this.onNewPost)
        this.social.post(message, hashImage, (err, _) => {
            if (!err) {
                this.setState({message:'', errorMessage: ''})
            } else {
                this.setState({errorMessage: err.message, isLoading: false})
            }
        })
    }

    onTextChange = (event) => {
        this.setState({message: event.target.value, errorMessage: ''})
    }

    onLikePost = (item) => {
        const { postId, address } = item
        this.social.NewBalance().watch(this.onNewBalance)
        this.social.like(address, postId, { value: web3.toWei(5, 'ether') }, (err, response) => {
            if (!err) {
                // TODO: show dialog error
            }
        })
    }

    onUnLikePost = (item) => {
        console.log('unlike post')
    }

    render() {
        return(
            <div>
                <div style={{display: 'flex', width: '100vw', height: '100vh'}}>
                    <div style={{width: '40%', height: '100%', display:'flex', textAlign: 'center', alignItems: 'center', justifyContent:'center', flexDirection: 'column', background: '#80808054'}}>
                        <div style={{width: '100%'}}>
                            <div style={{margin: '36px'}}>
                                <h2 style={{margin: '0'}}>Hi... {this.state.username}</h2>
                                <h5 style={{margin: '8px'}}>{this.state.myAddress}</h5>
                                <h5 style={{margin: '8px'}}>{`${web3.fromWei(this.state.balance, 'ether')} ETH`}</h5>
                                <Form onSubmit={this.onPost} error={this.state.errorMessage}>
                                    <TextArea autoHeight style={{ maxHeight: '500px' }} placeholder='Typing Message' onChange={this.onTextChange} value={this.state.message}/>
                                    <Message error header='Oops!' content={this.state.errorMessage}/>
                                </Form>
                                <Button style={{
                                    margin: '26px',
                                    width: '50%'
                                }} primary loading={this.state.isLoading} onClick={this.onPost}>Post</Button>
                            </div>
                        </div>
                    </div>
                    <div style={{width: '60%', overflow: 'auto', background: '#fafafa'}}>
                        <div style={{width: '100%', justifyContent: 'center', display: 'flex'}}>
                            <div style={{marginTop: '26px', marginBottom: '26px'}} >
                                <ListFeed items={this.state.posts} onLikePost={this.onLikePost} onUnLikePost={this.onUnLikePost}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Feed