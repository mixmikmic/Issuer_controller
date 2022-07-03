const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const NavLinkService = require('../services/NavLinkService');
const navLinkService = new NavLinkService();
navLinkService.registerCustomLinks([
    { "label": "Wallet", "url": "/subwallet/wallet" },
]);

router.use(function (req, res, next) {
    navLinkService.clearLinkClasses();
    navLinkService.setNavLinkActive('/subwallet');
    next();
});

router.get('/', async function (req, res, next) {
    res.redirect('/subwallet/wallet');
});

router.get('/wallet', async function (req, res, next) {
    const agentService = require('../services/AgentService');
    const subwallet = await agentService.getSubWallet();
    const walletId = await subwallet.map(e=>{ return e.wallet_id })
    // const token = await agentService.getSubWallet(subwallet.wallet_id)
    console.log(walletId);
    await subwallet.forEach(e => { 
        e.name = e.settings["wallet.name"] ;
    });
    console.log(subwallet);
    res.render('subwallet', {
        navLinks: navLinkService.getNavLinks(),
        customNavLinks: navLinkService.getCustomNavLinks(),
        subwallet
    });
});

router.get('/:id/remove', async function (req, res, next) {
    const connectionId = req.params.id;
    const state = req.query.state || '';

    if (connectionId) {
        const agentService = require('../services/AgentService');
        await agentService.removeConnection(connectionId);
    }

    const redirectUrl = `/connections/${state === 'invitation' ? 'pending' : 'active'}`;
    res.redirect(redirectUrl);
});

module.exports = router;