$vm.m365_init=function(){
    $vm.m365_sharepoint_uri="https://woolcockmed.sharepoint.com";
    $vm.m365_scope_sharepoint={
        scopes: ["https://woolcockmed.sharepoint.com/.default"]
    };
    $vm.m365_scope={
        scopes: ["user.read","User.Read.All","Files.Read.All","Sites.ReadWrite.All"/*",group.read.all"*/]
    };
    $vm.msalConfig={
        auth: {
            clientId: '3bcb40c5-fec0-4b3b-ba67-f4d46d577f97',  //f39f8959-8cd7-4570-8c0f-548306bf899a
        },
        cache: {
            cacheLocation: "localStorage",
            storeAuthStateInCookie: true
        }
    };
    $vm.m365_msal=new Msal.UserAgentApplication($vm.msalConfig);
    $vm.m365_signin=function (){
        $vm.m365_msal.handleRedirectCallback((error, response) => {
        });
        $vm.m365_msal.loginPopup($vm.m365_scope).then(function (loginResponse){
            if($vm.m365_msal.getAccount()!=undefined){
                $vm.user_name_3rd=$vm.m365_msal.getAccount().userName;
                $vm.issuer_3rd   ="microsoft";
                if($vm.app_after_3rd_signin!=undefined) $vm.app_after_3rd_signin();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }
    $vm.m365_signout=function() {
        $vm.m365_msal.logout();
    }
    $vm.m365_graph=function(url,callback){
        $vm.m365_msal.acquireTokenSilent($vm.m365_scope).then(function (tokenResponse) {
            var xmlHttp = new XMLHttpRequest();
            var mt1=new Date().getTime();
            xmlHttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200){
                    $("#_sys_dev_info_elapsed").html( (this.response.length/1000).toFixed(1)+"kb/"+(new Date().getTime()-mt1).toString()+"ms");
                    var data=JSON.parse(this.responseText);
                    callback(data);
                }
                else if(this.readyState == 4 && this.status == 403){
                    $vm.alert("No permission");
                    callback({});
                }
                if(this.status == 404){
                    $vm.alert(url+", 404 (Not found)");
                    callback({});
                }
            }
            xmlHttp.open("GET", url, true); // true for asynchronous
            xmlHttp.setRequestHeader('Authorization', 'Bearer ' + tokenResponse.accessToken);
            xmlHttp.send();
        }).catch(function (error){
            console.log(error);
            $vm.alert("You haven't signed in, or your previous session has expired.")
        });
    };
    //------------------------------------
    if($vm.m365_msal.getAccount()!=undefined){
        $vm.m365_msal.acquireTokenSilent($vm.m365_scope).then(function (tokenResponse) {
            $vm.user_name_3rd=$vm.m365_msal.getAccount().userName;
            $vm.issuer_3rd="microsoft";
            if($vm.app_after_3rd_signin!=undefined) $vm.app_after_3rd_signin();
        }).catch(function (error){
            console.log("more than 1 hour.");
        });
    }
    //------------------------------------
}
$vm.m365_init();
