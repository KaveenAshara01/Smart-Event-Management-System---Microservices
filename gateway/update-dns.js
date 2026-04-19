const axios = require('axios');

const DUCKDNS_DOMAIN = 'semsf';
const DUCKDNS_TOKEN = 'c6a997e4-a86f-4143-a19f-a9cc2bb87268';

async function updateDNS() {
    try {
        console.log('[DuckDNS] Starting DNS update...');
        // Wait 5 seconds to ensure networking is fully up
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Find our public IP using an external service
        const ipResponse = await axios.get('https://api.ipify.org');
        const publicIP = ipResponse.data;
        console.log(`[DuckDNS] Discovered Public IP: ${publicIP}`);

        // Update DuckDNS with this IP
        const duckUrl = `https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=${publicIP}`;
        const response = await axios.get(duckUrl);
        
        if (response.data === 'OK') {
            console.log(`[DuckDNS] Successfully updated domain ${DUCKDNS_DOMAIN}.duckdns.org to ${publicIP}`);
        } else {
            console.error(`[DuckDNS] Failed to update. Response was: ${response.data}`);
        }
    } catch (error) {
        console.error('[DuckDNS] Error updating DNS:', error.message);
    }
}

updateDNS();
