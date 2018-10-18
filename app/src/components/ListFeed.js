import React from "react"
import FeedItem from './FeedItem'
import { Feed } from 'semantic-ui-react'

function ListFeed(props) {
    var items = props.items
    return <Feed style={{overflow:'auto', willChange: 'transform' }}> {
        items.map(item => { 
            return <FeedItem item={item} onLikePost={props.onLikePost} onUnLikePost={props.onUnLikePost} isReporter={props.isReporter}/>
        })
    }
    </Feed>
}

export default ListFeed