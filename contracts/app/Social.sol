pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Social is Ownable, Pausable {

    uint public balance;
    address public owner;
    uint private minimumValue = 20000000;
    address public tokenContractAddress;

    ERC20 public ERC20Interface;

    event TransferSuccessful(address indexed sender, address indexed receiver, uint256 amount);
    event TransferFailed(address indexed sender, address indexed receiver, uint256 amount);

    struct Post {
        bytes32 id;
        bytes32 username;
        string message;
        string url;
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
    event NewPost(bytes32 id, bytes32 username, string message, string url, string hashImage, address owner, uint date);
    event NewBalance(address owner);

    modifier requireAccount() {
        require(users[msg.sender] != 0x0, "Sorry!, Not found account");
        _;
    }

    constructor(address _tokenContractAddress) public {
        owner = msg.sender;
        tokenContractAddress = _tokenContractAddress;
    }

    function register(bytes32 username) public {
        require(users[msg.sender] == 0x0, "Sorry!, This address registered");
        users[msg.sender] = username;
        addressUsers.push(msg.sender);
        emit NewUser(users[msg.sender], msg.sender);
    }

    function post(string message, string url, string hashImage) public requireAccount {
        bytes32 id = keccak256(abi.encodePacked(message, url, hashImage, now, msg.sender));
        bytes32 username = users[msg.sender];
        listPosts.push(Post(id, username, message, url, hashImage, msg.sender, now));
        emit NewPost(id, username, message, url, hashImage, msg.sender, now);
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

    function likeWithToken(address receiver, bytes32 postId, uint256 amount) public requireAccount whenNotPaused {
        require(receiver != msg.sender, "Can't like as yourself on the post");
        require(amount > 0, "minimum cost for like");

        address from = msg.sender;

        ERC20Interface = ERC20(tokenContractAddress);

        if (amount > ERC20Interface.allowance(from, address(this))) {
            emit TransferFailed(from, receiver, amount);
            revert();
        }

        ERC20Interface.transferFrom(from, receiver, amount);
        balance += amount;
        likes.push(LikePost(postId, from));
        blogger[receiver] += amount;
        uint tempValue = blogger[receiver];
        if (tempValue >= minimumValue) {
            reporters.push(receiver);
        }
        likeMapPost[postId]++;
        emit NewBalance(from);
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