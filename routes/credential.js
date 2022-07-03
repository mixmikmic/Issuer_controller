const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const NavLinkService = require('../services/NavLinkService');
const navLinkService = new NavLinkService();
navLinkService.registerCustomLinks([
    { "label": "all", "url": "/credential/all;" },
]);

router.use(function (req, res, next) {
    navLinkService.clearLinkClasses();
    navLinkService.setNavLinkActive('/credential');
    next();
});

router.get('/', async function (req, res, next) {
    res.redirect('/credential/all');
});

router.get('/all', async function (req, res, next) {
    const agentService = require('../services/AgentService');
    const list = await agentService.getCredentials();
    const credential = list.results;
   console.log(credential);
    res.render('credential', {
        navLinks: navLinkService.getNavLinks(),
        customNavLinks: navLinkService.getCustomNavLinks(),
        credential
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