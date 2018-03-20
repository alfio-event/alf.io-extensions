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

  var eventShortName = event.shortName;
  var listAddress = 'https://' + extensionParameters.dataCenter + '.api.mailchimp.com/3.0/lists/' + extensionParameters.listId + '/'
  var apiKey = extensionParameters.apiKey;
  
  createMergeFieldIfNotPresent(listAddress, apiKey, event.id, eventShortName);
  send();
}

function createMergeFieldIfNotPresent(listAddress, apiKey, eventId, eventShortName) {
  log.warn('listAddress is ' + listAddress);
  log.warn('apiKey is ' + apiKey);
  log.warn('eventId is ' + eventId);
  log.warn('eventShortName is ' + eventShortName);
}

function send() {
}
