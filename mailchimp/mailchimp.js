/**
 * 
 * 
 */
function getScriptMetadata() {
    return {
        id: 'mailchimp', //
        version: 0, //
        async: true,
        events: [
            'RESERVATION_CONFIRMED', //fired on reservation confirmation. No results expected.
            'TICKET_ASSIGNED', //fired on ticket assignment. No results expected.
            'WAITING_QUEUE_SUBSCRIPTION', //fired on waiting queue subscription. No results expected.
        ]
        ,
        parameters: {fields: [
          {name:'dataCenter',description:'The MailChimp data center used by your account (e.g. us6)',type:'TEXT',required:true},
          {name:'apiKey',description:'The Mailchimp API Key',type:'TEXT',required:true},
          {name:'listId',description:'The list ID, see http://kb.mailchimp.com/lists/manage-contacts/find-your-list-id',type:'TEXT',required:true},
          ], configurationLevels: ['ORGANIZATION', 'EVENT']}

    };
}

/**
 * Executes the extension.
 * @param scriptEvent
 * @returns Object
 */
function executeScript(scriptEvent) {
    log.warn('hello from script with event: ' + scriptEvent);
    log.warn('extension parameters are: ' + extensionParameters);
}
