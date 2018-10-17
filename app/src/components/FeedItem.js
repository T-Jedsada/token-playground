import React from "react"
import { Feed, Image } from 'semantic-ui-react'
import Identicon from 'identicon.js'

function FeedItem(props) {
    var item = props.item
    return(
        <div style={{ willChange: 'transform' }}>
            <Feed.Event>
                <div class="label">
                    <Image style={{ width:'35px', height: '35px', border: '1px solid gray', marginTop: '6px' }} avatar src={`https://www.gravatar.com/avatar/${item.address}?s=50&d=identicon&r=PG`}/>
                </div>
                <Feed.Content>
                    <Feed.Summary style={{ textAlign: 'start' }}><a>{item.address}</a></Feed.Summary>
                    <Feed.Extra text style={{ textAlign: 'start', maxWidth: '700px', wordBreak: 'break-all' }}>{item.message}</Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        </div>
    )
}

export default FeedItem