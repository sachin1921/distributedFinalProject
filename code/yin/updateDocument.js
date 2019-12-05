'use strict';

const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');

//Import local fabric wallet
const wallet = new FileSystemWallet('/home/user/wallets');
async function main() {

    // Gateway to access the local fabric network 
    const gateway = new Gateway();

    try {

	//The user name below must match the idetntiy created via ibm blockchain platform 
	//a copy of these identies is included in .localfabric wallet. However, it's adviced to regenerate them
        const userName = 'yin';
        
        // File path for connections 
        let fpath = fs.readFileSync('/home/user/Desktop/blckChainAPp/connection.json', 'utf8');
        let connectionProfile = JSON.parse(fpath);

	//Connect to gateway via specified parameters	
	let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };

        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);


        //Once connected to gateway you need access to channel. 
	console.log('Use network channel: mychannel.');
        const network = await gateway.getNetwork('mychannel');

	//Once gained access to channel we now need access to document contract 
        console.log('Use Document Contract');

        const contract = await network.getContract('documentContract', '');

	//We submit a transaction using createDocument("document1", "secrete for the final time")
	 	
        let query = await contract.submitTransaction('updateDocument', 'document1', 'secrete for the final time New');

        query = "data = '" + query.toString().replace(/\\"/g,'') + "'";

        console.log('the query response is ' + query);
        console.log(' ');

        console.log('Transaction complete.');
        console.log(' ');

        console.log('==========================================================================');
        console.log(' ');

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('Query Execution complete.');

}).catch((e) => {

    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
