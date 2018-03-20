/**
 * 
 * 
 */
function getScriptMetadata() {
    return {
        id: 'mailchimp', //
        displayName: 'MailChimp integration',
        version: 1, //
        async: true,
        events: [
            'RESERVATION_CONFIRMED', //fired on reservation confirmation. No results expected.
            'TICKET_ASSIGNED', //fired on ticket assignment. No results expected.
            'WAITING_QUEUE_SUBSCRIPTION' //fired on waiting queue subscription. No results expected.
        ],
        parameters: {
            fields: [
              {name:'dataCenter',description:'The MailChimp data center used by your account (e.g. us6)',type:'TEXT',required:true},
              {name:'apiKey',description:'The Mailchimp API Key',type:'TEXT',required:true},
              {name:'listId',description:'The list ID, see http://kb.mailchimp.com/lists/manage-contacts/find-your-list-id',type:'TEXT',required:true}
            ],
            configurationLevels: ['ORGANIZATION', 'EVENT']
        }
    };
}

var CustomerName = Java.type('alfio.model.CustomerName');

/**
 * Executes the extension.
 * @param scriptEvent
 * @returns Object
 */
function executeScript(scriptEvent) {
    if('TICKET_ASSIGNED' === scriptEvent) {
        var customerName = new CustomerName(ticket.fullName, ticket.firstName, ticket.lastName, event);
        subscribeUser(ticket.email, customerName, ticket.userLanguage, event);
    } else if ('RESERVATION_CONFIRMED' === scriptEvent) {
        var customerName = new CustomerName(reservation.fullName, reservation.firstName, reservation.lastName, event);
        subscribeUser(reservation.email, customerName, reservation.userLanguage, event);
    } else if ('WAITING_QUEUE_SUBSCRIPTION' === scriptEvent) {
        var customerName = new CustomerName(waitingQueueSubscription.fullName, waitingQueueSubscription.firstName, waitingQueueSubscription.lastName, event);
        subscribeUser(waitingQueueSubscription.emailAddress, customerName, waitingQueueSubscription.userLanguage, event);
    }
}


function subscribeUser(email, customerName, language, event) {
  log.warn('email is ' + email);
  log.warn('customer name is ' + customerName);
  log.warn('language is ' + language);
  log.warn('event is ' + event);
}
