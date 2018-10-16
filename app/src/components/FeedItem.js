import React from "react"
import { Feed } from 'semantic-ui-react'
import Identicon from 'identicon.js'

function FeedItem(props) {
    var item = props.item
    return(
        <div style={{ willChange: 'transform' }}>
            <Feed.Event>
                <div class="label">
                    <img style={{ width:'35px', height: '35px' }} class="ui avatar image" src={`https://robohash.org/${item.address}?set=set4?size=40x40`}/>
                </div>
                <Feed.Content>
                    <Feed.Summary><a>{item.address}</a></Feed.Summary>
                    <Feed.Extra text >{item.message}</Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        </div>
    )
}

export default FeedItem