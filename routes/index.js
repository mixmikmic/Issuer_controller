const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const NavLinkService = require('../services/NavLinkService');
  const navLinkService = new NavLinkService();

  res.render('index', { navLinks: navLinkService.getNavLinks() });
});

router.get('/status', async function(req, res, next) {
  const agentService = require('../services/AgentService');

  const status = await agentService.getStatus();
  res.status(200).json({ status: status ? 'up' : 'down' });
});


router.post('/webhooks/topic/:id', (req,res)=> {
  console.log("Agent_1", req.params.id ,req.body);
  res.end();
});

module.exports = router;
