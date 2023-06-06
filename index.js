const crypto  = require("crypto");

class Transaction{
    constructor(amount, senderPublicKey, receiverPublicKey){
        this.amount = amount;
        this.senderPublicKey = senderPublicKey;
        this.receiverPublicKey = receiverPublicKey;

    }
    toString(){
        return JSON.stringify(this);
    }
}

class Block{
    constructor(previousHash, transaction, timestamp = Date.now()){
        this.previousHash = previousHash;
        this.transaction = transaction;
        this.timestamp = timestamp;
    }

    getHash(){
        const json = JSON.stringify(this);
        const hash = crypto.createHash("SHA256");
        hash.update(json).end();
        const hex = hash.digest("hex");
        return hex;
    }

    toString(){
        JSON.stringify(this);
    }
}

class Chain{
    static instance = new Chain();

    constructor(){
        this.chain = [new Block("", new Transaction(100, "temp", "temp"))];

    }

    getPreviousBlockHash(){
        return this.chain[this.chain.length - 1].getHash();
    }

    insertBlock(transaction, senderPublicKey, sig){
        const verify = crypto.createVerify("SHA256");

        verify.update(transaction.toString());

        const isValid = verify.verify(senderPublicKey, sig);

        if(isValid){
            const block = new Block(this.getPreviousBlockHash(), transaction);
            console.log("Block Added", block.toString());
            this.chain.push(block);
        }
    }
}

class Wallets{
    constructor(){

        const keys = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyencoding: { type:"spki", format: "pem"},
            privateKeyEncoding: {type: "pkcs8", format: "pem"}
        });

        this.privateKey = keys.privateKey;
        this.publicKey = keys.publicKey;
    }

    send(amount, receiverPublicKey){

        const transaction = new Transaction(
            amount,
            this.publicKey,
            receiverPublicKey
        );

        const shaSign = crypto.createSign("SHA256");

        shaSign.update(transaction.toString()).end();

        const signature = shaSign.sign(this.privateKey);
        Chain.instance.insertBlock(transaction, this.publicKey, signature);
    }
}

const Tanjiro = new Wallets();
const Giyu = new Wallets();
const Nezuko = new Wallets();

Tanjiro.send(50, Nezuko.publicKey);
Giyu.send(23, Tanjiro.publicKey);
Nezuko.send(5, Giyu.publicKey);

console.log(Chain.instance);