<script runat="server" type="text/javascript">
Platform.Load("Core", "1.1.1");
var authHdr = HTTPHeader.GetValue("authorization");
var postData = Platform.Request.GetPostData(); // JSON posted from Zoom
var json = Platform.Function.ParseJSON(postData);
var jsonstr = Platform.Function.Stringify(json);

var event = json.event;

/* Zoom Webhook URL validation | Zoom automatically revalidates webhooks every 72 hours :: START */
if (event === 'endpoint.url_validation') 
{
    var plainToken = json.payload.plainToken;
    var apiUrl = "https://YourHerokuAppURL.herokuapp.com/webhook";   //heroku-app-url
    var payload = {
                    "payload": {
                                "plainToken": plainToken
                                },
                    "event": "endpoint.url_validation"
                    };
    var payloadString = Stringify(payload);
    var response = HTTP.Post(apiUrl, "application/json", payloadString);
    if (response.StatusCode === 200) 
    {
        var jsonResponse = Platform.Function.ParseJSON(response.Response.toString());
        Write(Stringify(jsonResponse));     //here is were the reponse JSON sent back to Zoom url validation
    } 

} 
/* Zoom Webhook URL validation | Zoom automatically revalidates webhooks every 72 hours :: END */

if (event === 'meeting.participant_joined')
{
    var rows = Platform.Function.InsertData("Zoom_Log_VCV",["Data","AuthHeader"],[jsonstr,authHdr]); //Your SFMC DE to store log

    if (rows > 0)
    {
        var regID, fName, lName, emailID, mtgID, mtgTopic, regStatus
        event_ts = json.event_ts;
        fName = json.payload.object.participant.user_name;
        lName = json.payload.object.participant.phone_number; 
        emailID = json.payload.object.participant.email;
        mtgID = json.payload.object.id;
        mtgTopic = json.payload.object.topic;
        regStatus = json.payload.object.registrant.status;

        rows = Platform.Function.InsertData("ZoomWebhookData",["event_ts","FirstName","LastName","EmailID","MeetingID","MeetingTopic","MeetingStatus"],
        [event_ts,fName,lName,emailID,mtgID,mtgTopic,regStatus]); //Your SFMC DE to store Wehbook event data
    }

}
</script>

