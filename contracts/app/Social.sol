pragma solidity ^0.4.24;

contract Social {

    uint public balance;
    address private owner;
    uint private minimumValue = 2000000000000000000;

    struct Post {
        bytes32 id;
        string message;
        string hashImage;
        address owner;
        uint date;
    }

    struct LikePost {
        bytes32 postId;
        address owner;
    }

    Post[] public listPosts;
    LikePost[] public likes; 

    mapping (address => bytes32) private users;
    mapping(address => uint) private blogger;
    mapping(bytes32 => uint) private likeMapPost;
    address[] private addressUsers;
    address[] private reporters;

    event NewUser(bytes32 name, address account);
    event NewPost(bytes32 id, string message, string hashImage, address owner, uint date);
    event NewBalance(address owner);

    modifier requireAccount() {
        require(users[msg.sender] != 0x0, "Sorry!, Not found account");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function register(bytes32 username) public {
        require(users[msg.sender] == 0x0, "Sorry!, This address registered");
        users[msg.sender] = username;
        addressUsers.push(msg.sender);
        emit NewUser(users[msg.sender], msg.sender);
    }

    function post(string message, string hashImage) public requireAccount {
        bytes32 id = keccak256(abi.encodePacked(message, hashImage, now, msg.sender));
        listPosts.push(Post(id, message, hashImage, msg.sender, now));
        emit NewPost(id, message, hashImage, msg.sender, now);
    }

    function like(address receiver, bytes32 postId) public requireAccount payable {
        require(receiver != msg.sender, "Can't like as yourself on the post");
        uint amount = msg.value;
        require(amount > 0, "minimum cost for like");
        balance += amount;
        likes.push(LikePost(postId, msg.sender));
        receiver.transfer(amount);
        blogger[receiver] += amount;
        uint tempValue = blogger[receiver];
        if (tempValue >= minimumValue) {
            reporters.push(receiver);
        }
        likeMapPost[postId]++;
        emit NewBalance(msg.sender);
    }

    function getBloggerMaxValue() public view returns (address, uint) {
        uint _maxAmount;
        address addressBlogger;
        uint maxValue;
        for (uint i=0; i < addressUsers.length; i++) {
            address _addressUser = addressUsers[i];
            uint amount = blogger[_addressUser];
            if (amount > _maxAmount) {
                _maxAmount = amount;
                if (_maxAmount >= minimumValue) {
                    maxValue = amount;
                    addressBlogger = _addressUser;
                }
            }
        }
        return (addressBlogger, maxValue);
    }

    function checkPermission() public view returns (bool) {
        bool isReporter = false;
        for (uint i=0; i < reporters.length; i++) {
            if (reporters[i] == msg.sender) {
                isReporter = true;
                break;
            }
        }
        return isReporter;
    }

    function getReporters() public view returns (address[]) {
        return reporters;
    }

    function getCountUser() public view returns (uint count) {
        return addressUsers.length;
    }

    function getLiskeCountByPostId(bytes32 postId) public view returns (uint) {
        return likeMapPost[postId];
    }

    function getUsername() public view returns (bytes32 username) {
        return users[msg.sender];
    }

    function getTotalPost() public view returns (uint totalPost) {
        return listPosts.length;
    }
}