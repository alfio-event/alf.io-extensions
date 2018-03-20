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
var Request = Java.type('okhttp3.Request');
var RequestBody = Java.type('okhttp3.RequestBody');
var Credentials = Java.type('okhttp3.Credentials');
var MediaType = Java.type('okhttp3.MediaType');
var HashMap = Java.type('java.util.HashMap');
var Map = Java.type('java.util.Map');
var JavaString = Java.type('java.lang.String');


var MERGE_FIELDS = "merge-fields/";
var ALFIO_EVENT_KEY = "ALFIO_EKEY";
var APPLICATION_JSON = "application/json";
var FAILURE_MSG = "cannot add user {email: %s, name:%s, language: %s} to the list (%s)";
var LIST_MEMBERS = "members/";

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
  var md5Email = getMd5Email(email);
  send(event.id, listAddress + LIST_MEMBERS + md5Email, apiKey, email, customerName, language, eventShortName);
}

function createMergeFieldIfNotPresent(listAddress, apiKey, eventId, eventShortName) {
  var request = new Request.Builder()
    .url(listAddress + MERGE_FIELDS)
    .header("Authorization", Credentials.basic("alfio", apiKey))
    .get()
    .build();
  try {
    var response = httpClient.newCall(request).execute();
    var body = response.body();
    if(body == null) {
      log.warn("null response from mailchimp for list {}", listAddress);
      return;
    }
    var responseBody = body.string();
    if(!responseBody.contains(ALFIO_EVENT_KEY)) {
      log.debug("can't find ALFIO_EKEY for event " + eventShortName);
      createMergeField(listAddress, apiKey, eventShortName, eventId);
    }
    response.close();
  } catch (e) {
    log.warn("exception while reading merge fields for event id "+eventId, e);
    extensionLogger.logWarning(JavaString.format("Cannot get merge fields for %s, got: %s", eventShortName, e.getMessage ? e.getMessage() : e));
  }
}

function createMergeField(listAddress, apiKey, eventShortName, eventId) {
  var mergeField = new HashMap();
  mergeField.put("tag", ALFIO_EVENT_KEY);
  mergeField.put("name", "Alfio's event key");
  mergeField.put("type", "text");
  mergeField.put("required", false);
  mergeField.put("public", false);
  var request = new Request.Builder()
    .url(listAddress + MERGE_FIELDS)
    .header("Authorization", Credentials.basic("alfio", apiKey))
    .post(RequestBody.create(MediaType.parse(APPLICATION_JSON), GSON.toJson(mergeField, Map.class)))
    .build();
  try {
    var response = httpClient.newCall(request).execute()
    if(!response.isSuccessful()) {
      var body = response.body();
      log.warn("can't create {} merge field. Got: {}", ALFIO_EVENT_KEY, body != null ? body.string() : "null");
    }
    response.close();
  } catch(e) {
    log.warn("exception while creating ALFIO_EKEY for event id "+eventId, e);
    extensionLogger.logWarning(JavaString.format("Cannot create merge field for %s, got: %s", eventShortName, e.getMessage ? e.getMessage() : e));
  }
}

function send(eventId, address, apiKey, email, name, language, eventShortName) {
  var content = new HashMap();
  content.put("email_address", email);
  content.put("status", "subscribed");
  var mergeFields = new HashMap();
  mergeFields.put("FNAME", name.isHasFirstAndLastName() ? name.getFirstName() : name.getFullName());
  mergeFields.put(ALFIO_EVENT_KEY, eventShortName);
  content.put("merge_fields", mergeFields);
  content.put("language", language);
  var request = new Request.Builder()
    .url(address)
    .header("Authorization", Credentials.basic("alfio", apiKey))
    .put(RequestBody.create(MediaType.parse(APPLICATION_JSON), GSON.toJson(content, Map.class)))
    .build();
  try {
    var response = httpClient.newCall(request).execute();
    if(response.isSuccessful()) {
      extensionLogger.logSuccess(JavaString.format("user %s has been subscribed to list", email));
      response.close();
      return;
    }
    var body = response.body();
    if(body == null) {
      response.close();
      return;
    }
    var responseBody = body.string();
    if (response.code() != 400 || responseBody.contains("\"errors\"")) {
      extensionLogger.logError(JavaString.format(FAILURE_MSG, email, name, language, responseBody));
    } else {
      extensionLogger.logWarning(JavaString.format(FAILURE_MSG, email, name, language, responseBody));
    }
    response.close();
    return;
  } catch(e) {
    log.warn("exception while creating ALFIO_EKEY for event id "+eventId, e);
    extensionLogger.logError(JavaString.format("Cannot create merge field for %s, got: %s", eventKey, e.getMessage ? e.getMessage() : e));  
  }
}

function getMd5Email(email) {
  try {
    var Hex = Java.type('org.apache.commons.codec.binary.Hex');
    var MessageDigest = Java.type('java.security.MessageDigest');
    return Hex.encodeHexString(MessageDigest.getInstance("MD5").digest(email.trim().getBytes("UTF-8")));
  } catch(e) {
    log.warn(e);
  }
}
