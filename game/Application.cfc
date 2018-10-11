component {

    this.name              = "GameDemo";
    this.sessionmanagement = true;
    this.sessiontimeout    = createTimeSpan(1,0,0,0);
    this.serialization.preservecaseforstructkey = true;

    // websockets
    this.wschannels = [
        {name:"game",cfclistener:"GameListener"}
    ];

    public boolean function onApplicationStart(){
        application.timestamp = getHttpTimeString();
        return true;
    }

    public boolean function onRequestStart(targetPage){
        if (structKeyExists(url,"reload")){
            // tell everyone to reconnect
            WsPublish("game","FORCE-RECONNECT");
            applicationStop();
            location('./',false);
        }
        return true;
    }
}