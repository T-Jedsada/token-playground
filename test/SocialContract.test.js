const truffleAssert = require('truffle-assertions')
const SocialContract = artifacts.require('Social')
const strUsername = '20scoops'
const hashIPFS = 'Qmekof4qUrCNvAnAT1RXkTXcv3gHSj23kYesHgMhpHcwRX'
var postId = ''

contract('SocialContract', accounts => {
    var social
    beforeEach(async () => {
        social = await SocialContract.deployed()
    })

    it('register user', async () => {
        const username = web3.fromAscii(strUsername)
        const tx = await social.register(username, {
            from: accounts[0]
        })

        const countUser = await social.getCountUser()
        assert.equal(1, countUser)

        truffleAssert.eventEmitted(tx, 'NewUser', ev => {
            const decodeUsername = web3.toAscii(ev.name).replace(/\u0000/g, '')
            return decodeUsername === strUsername
        })
        truffleAssert.eventNotEmitted(tx, 'NewIPSHHash')
    })

    it('register already account', async () => {
        const username = web3.fromAscii(strUsername)
        try {
            await social.register(username, {
                from: accounts[0]
            })
        } catch (err) {
            assert(err)
            return
        }
        assert(false)
    })

    it('post message', async () => {
        const tx = await social.post("20scoops", "", {
            from: accounts[0]
        })
        truffleAssert.eventEmitted(tx, 'NewPost', response => {
            postId = response.id
            return response.message === '20scoops' && response.hashImage === ''
        })
    })

    it('post photo', async () => {
        const tx = await social.post("", hashIPFS, {
            from: accounts[0]
        })
        truffleAssert.eventEmitted(tx, 'NewPost', response => {
            return response.message === '' && response.hashImage === hashIPFS
        })
    })

    it('not have acccount to post ', async () => {
        try {
            await social.post("message", hashIPFS, {
                from: accounts[1]
            })
        } catch (err) {
            assert(err)
            return
        }
        assert(false)
    })

    it('like post', async () => {
        const oldBalance = await web3.eth.getBalance(accounts[0]).toNumber()
        const username = web3.fromAscii(strUsername)
        await social.register(username, {
            from: accounts[2]
        })
        const tx = await social.like(accounts[0], postId, {
            from: accounts[2],
            value: web3.toWei('2', 'ether')
        })
        assert.ok(tx)
        const newBalance = await web3.eth.getBalance(accounts[0]).toNumber()
        const difference = newBalance - oldBalance
        assert.equal(difference, web3.toWei('2', 'ether'))

        truffleAssert.eventEmitted(tx, 'NewBalance', response => {
            return response.owner === accounts[2]
        })
    })

    it('not have acccount like post', async () => {
        try {
            await social.like(accounts[0], postId, {
                from: accounts[1]
            })
        } catch (err) {
            assert(err)
            return
        }
        assert(false)
    })

    it('like as yourself post', async () => {
        try {
            await social.like(accounts[0], postId, {
                from: accounts[0]
            })
        } catch (err) {
            assert(err)
            return
        }
        assert(false)
    })

    it('like post not have value', async () => {
        try {
            await social.like(accounts[0], postId, {
                from: accounts[2]
            })
        } catch (err) {
            assert(err)
            return
        }
        assert(false)
    })

    it('reporter max value', async () => {
        const result = await social.getBloggerMaxValue()
        assert.equal(result[1].toNumber(), web3.toWei('2', 'ether'))
    })

    it('address is reporter', async () => {
        const result = await social.checkPermission({
            from: accounts[0]
        })
        assert.equal(result, true)
    })

    it('address is not reporter', async () => {
        const result = await social.checkPermission({
            from: accounts[2]
        })
        assert.equal(result, false)
    })

    it('total user', async () => {
        const totalUser = await social.getCountUser()
        assert.equal(totalUser.toNumber(), 2)
    })

    it('list reporter', async () => {
        const reporters = await social.getReporters()
        assert.equal(reporters.length, 1)
    })

    it('like count by post should be 2 times', async () => {
        await social.like(accounts[0], postId, {
            from: accounts[2],
            value: web3.toWei('2', 'ether')
        })
        const count = await social.getLiskeCountByPostId(postId)
        assert.equal(count.toNumber(), 2)
    })

    it('get username', async () => {
        const username = await social.getUsername()
        assert(username.length > 0)
    })

    it('total post', async () => {
        const totalUser = await social.getTotalPost()
        assert(totalUser.toNumber() > 0)
    })
})