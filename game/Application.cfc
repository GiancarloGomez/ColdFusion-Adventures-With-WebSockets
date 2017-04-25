component output="false"{

    this.name              = "GameDemo";
    this.sessionmanagement = true;
    this.sessiontimeout    = createTimeSpan(1,0,0,0);

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
            WsPublish("chat","FORCE-RECONNECT");
            applicationStop();
            location('./',false);
        }
        return true;
    }

}