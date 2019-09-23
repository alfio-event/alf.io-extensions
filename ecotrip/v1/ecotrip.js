/**
 * Basic script for EcoTrip integration.
 * Does not call an external service.
 * 
 */
function getScriptMetadata() {
    return {
        id: 'ecotrip', //
        displayName: 'Ecotrip integration',
        version: 1, //
        async: true,
        events: [
            'RESERVATION_CONFIRMED'
        ],
        parameters: {
            fields: [
              {name:'apiKey',description:'The EcoTrip API Key',type:'TEXT',required:true}
            ],
            configurationLevels: ['ORGANIZATION', 'EVENT']
        }
    };
}

/**
 * Executes the extension.
 * @param scriptEvent
 * @returns Object
 */
function executeScript(scriptEvent) {
     if ('RESERVATION_CONFIRMED' === scriptEvent) {
        retrieveMessageText();
    } else {
        log.error("Not implemented for {}", scriptEvent);
    }
}


function retrieveMessageText() {
  var apiKey = extensionParameters.apiKey;
  var eventShortName = event.shortName;  
  var zipCode = billingDetails.zip;
  var country = billingDetails.country;
  send(apiKey, eventShortName, zipCode, country);
}

function send(eventId, address, apiKey, email, name, language, eventShortName) {
  var content = new HashMap();
  content.put("apiKey", apiKey);
  content.put("eventShortName", eventShortName);
  content.put("zipCode", zipCode);
  content.put("country", country);
  //For now just return a simple message
  return 'Travelling to ' + eventShortName + ' from ' country '? Have you considered taking the train?';
}
