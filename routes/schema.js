const e = require('express');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { resolve } = require('handlebars-helpers/lib/path');
const AgentService = require('../services/AgentService');

const NavLinkService = require('../services/NavLinkService');
const navLinkService = new NavLinkService();
navLinkService.registerCustomLinks([
    { "label": "active", "url": "/schema/active" },
    { "label": "new", "url": "/schema/new" },
]);

router.use(function (req, res, next) {
    navLinkService.clearLinkClasses();
    navLinkService.setNavLinkActive('/schema');
    next();
});
let schema = []
router.get('/', async function (req, res, next) {
res.redirect('/schema/active');
});

router.get('/active', async function (req, res, next) {
    const agentService = require('../services/AgentService');
    const allSchema = await agentService.getSchema();
    getDetails(allSchema).then(()=>{
        console.log(schema);
        res.render('schema', {
            navLinks: navLinkService.getNavLinks(),
            customNavLinks: navLinkService.getCustomNavLinks(),
            schema
        })
    }
    );
});

function getDetails(allSchema){
    return new Promise((resolve,reject) =>{
        allSchema.schema_ids.forEach(async (e,i)=>{
            let result = await AgentService.getSchemaDetails(e)
            schema[i] = { "schema_id" : e , "schema_name" : e.split(":")[2] , details : result.schema}
        })
        resolve();
    })
}

router.get('/new', handleNewSchema);

async function handleNewSchema(req, res, next) {
    navLinkService.setCustomNavLinkActive('/schema/new');
    res.render('new_schema', {
        navLinks: navLinkService.getNavLinks(),
        customNavLinks: navLinkService.getCustomNavLinks(),
    });
}
router.post('/form', handleform, handleNewSchemaPost, handleNewCredDefPost);


async function handleform(req, res, next) {
    
    const attrib =  req.body.attributes.split(',')
    let revocation 
        if(req.body.revocation=='on'){
            revocation = true
        }else revocation = false
    
    const schema = {
        "attributes": attrib,
          "schema_name": req.body.schema_name,
          "schema_version":  req.body.schema_version,
          "revocation" : revocation,
          "size": req.body.size
    }
    console.log(schema);
    req.body = schema
    res.redirect('/schema')
    next()
}

router.post('/new', handleNewSchemaPost, handleNewCredDefPost);

async function handleNewSchemaPost(req, res, next) {
 
    const agentService = require('../services/AgentService');
    const schema = req.body
    const getSchema = await agentService.createSchema(schema)
    console.log(getSchema.schema_id);
    // const invitation = await agentService.createInvitation();
    // if (invitation) {
    //     invitation.invitation = JSON.stringify(invitation.invitation, null, 4);
    // }
    req.schemaRequest = schema
    req.schema_id = getSchema.schema_id
    next();
}

async function handleNewCredDefPost(req, res, next) {
    console.log("schemaRequest", req.schemaRequest);

    const agentService = require('../services/AgentService');
    const cred_def =  await agentService.createCredDef(req.schema_id,  req.schemaRequest.revocation,  req.schemaRequest.schema_name + req.schemaRequest.schema_version,  req.schemaRequest.size)
    const response = {"schema_id": req.schema_id, "cred_def" : cred_def.credential_definition_id}
    res.send(response)
    console.log(response);

}



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