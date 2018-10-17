import React from "react"
import { Feed, Image, Icon } from 'semantic-ui-react'
import makeBlockie from 'ethereum-blockies-base64';

function FeedItem(props) {
    var item = props.item
    return(
        <Feed.Event>
                <div class="label">
                    <Image style={{ width:'35px', height: '35px', border: '1px solid #847e7e9e', marginTop: '6px' }} avatar src={makeBlockie(item.address)}/>
                </div>
                <Feed.Content>
                    <Feed.Summary style={{ textAlign: 'start' }}><a>{item.address}</a></Feed.Summary>
                    <Feed.Extra text style={{ textAlign: 'start', maxWidth: '700px', wordBreak: 'break-all' }}>{item.message}</Feed.Extra>
                    <Feed.Meta>
                        <Feed.Like onClick={() => {props.onLikePost(item)}}><Icon name='thumbs up'/>1,999 Likes</Feed.Like>
                        <Feed.Like onClick={() => {props.onUnLikePost(item)}}><Icon name='thumbs down'/>99 Likes</Feed.Like>
                    </Feed.Meta>
                </Feed.Content>
        </Feed.Event>
    )
}

export default FeedItem