    var transcriptionCanvases = [];
    var focusItem = [null,null];
    var transcriptionFile = "";
    var transcriptionObject = {};
    var projectID = 0;
    var dragHelper = "<div id='dragHelper'></div>";
    var liveTool = "none";
    var zoomMultiplier = 2;
    var isMagnifying = false;
    var isPeeking = false;
    var toggleMove = false;
    var peekMemory = [];
    var currentFolio = 0; //The current folio number.  It runs from 1 -> infinity, remember to subtract 1 when referring to index.  
    var isFullscreen = true;
    var line = false;
    var isAddingLines = false;
    var charactersForButton = "";
    var tagsForButton = "";
    var colorList = ["rgba(153,255,0,.4)", "rgba(0,255,204,.4)", "rgba(51,0,204,.4)", "rgba(204,255,0,.4)", "rgba(0,0,0,.4)", "rgba(255,255,255,.4)", "rgba(255,0,0,.4)"];
    var colorThisTime = "rgba(255,255,255,.4)";
    var annoLists = [];
    var loggedInUser = false;
    var userIsAdmin = false;
    var adjustRatio = 0;
    var imgBottomPositionRatio = 0;
    var imgTopPositionRatio = 0;
    var navMemory = 0;
    var minimalLines = false;
    //var basePath = window.location.protocol + "//" + window.location.host;
    
    /* Load the interface to the first page of the manifest. */
    function firstFolio(parsing){
        currentFolio = parseInt(currentFolio);
        if(parseInt(currentFolio) !== 1){
            if(parsing === "parsing"){
                $(".pageTurnCover").show();
                fullPage();
                focusItem = [null,null];
                currentFolio = 1;
                loadTranscriptionCanvas(transcriptionFolios[0], parsing);
                setTimeout(function(){
                hideWorkspaceForParsing();
                    $(".pageTurnCover").fadeOut(1500);
                }, 800);
            }
            else{
                focusItem = [null,null];
                currentFolio = 1;
                loadTranscriptionCanvas(transcriptionFolios[0], "");
            }
            
            
        }
    }
    
    /* Load the interface to the last page of the manifest. */
    function lastFolio(parsing){
        currentFolio = parseInt(currentFolio);
        var lastFolio = transcriptionFolios.length;
        if(parseInt(currentFolio) !== parseInt(lastFolio)){
            if(parsing === "parsing"){
                $(".pageTurnCover").show();
                fullPage();
                focusItem = [null,null];
                currentFolio = lastFolio;
                loadTranscriptionCanvas(transcriptionFolios[lastFolio-1], parsing);
                setTimeout(function(){
                    hideWorkspaceForParsing();
                    $(".pageTurnCover").fadeOut(1500);
                }, 800);
            }
            else{
                focusItem = [null,null];
                currentFolio = lastFolio;
                loadTranscriptionCanvas(transcriptionFolios[lastFolio-1], "");
            }
        }
    }
    /* Load the interface to the previous page from the one you are on. */
    function previousFolio(parsing){
        currentFolio = parseInt(currentFolio);
        if(parseInt(currentFolio) > 1){
            if(parsing === "parsing"){
                $(".pageTurnCover").show();
                fullPage();
                focusItem = [null, null];
                currentFolio -= 1;
                loadTranscriptionCanvas(transcriptionFolios[currentFolio - 1], parsing);
                setTimeout(function(){
                    hideWorkspaceForParsing();
                    $(".pageTurnCover").fadeOut(1500);
                }, 800);
            }
            else{
                focusItem = [null, null];
                currentFolio -= 1;
                loadTranscriptionCanvas(transcriptionFolios[currentFolio - 1], "");
            }
        }
        else{
            //console.log("BUGGER");
        }
    }
    
    /* Load the interface to the next page from the one you are on. */
    function nextFolio(parsing){
        currentFolio = parseInt(currentFolio);
        if(parseInt(currentFolio) !== transcriptionFolios.length){
            if(parsing === "parsing"){
                $(".pageTurnCover").show();
                fullPage();
                focusItem = [null, null];  
                currentFolio += 1;
                loadTranscriptionCanvas(transcriptionFolios[currentFolio-1], parsing);
                setTimeout(function(){
                    hideWorkspaceForParsing();
                    $(".pageTurnCover").fadeOut(1500);
                }, 800);
            }
            else{
                focusItem = [null, null];  
                currentFolio += 1;
                loadTranscriptionCanvas(transcriptionFolios[currentFolio-1], "");
            }
            
        }
        else{
            //console.log("BOOGER");
        }
    }
    
    /* Test if a given string can be parsed into a valid JSON object.
     * @param str  A string
     * @return bool
     */
    function isJSON(str) {
        var r = true;
        if(typeof str === "object"){
            r = true;
        }
        else{
            try {
                JSON.parse(str);
                r=true;
            } 
            catch (e) {
               r = false;
            }
        }
        return r;
    };
    

    function resetTranscription(){
        window.location.reload();

    }
    /* The tools for newberry are hard set in the html page, no need for this function. */
    
//    function getProjectTools(projectID){
//        var url = "http://localhost:8080/getProjectTPENServlet?projectID="+projectID;
//        $.ajax({
//            url: url,
//            type:"GET",
//            success: function(activeProject){
//                var toolArea = $("#iTools");
//                var projectTools = activeProject.projectTool; //These are all iframe tools
////                $.each(projectTools, function(){
////                    var toolLabel = this.label;
////                    var toolSource = this.source;
////                    var projectTool = $('<div id="userTool_'+toolLabel+'" class="split iTool">\n\
////                        <div class="fullScreenTrans">Full Screen Transcription</div>\n\
////                        <iframe id="tool_'+toolLabel+'" src="'+toolSource+'">\n\
////                        </iframe>\n\
////                    </div>');
////                    toolArea.append(projectTool);
////                });
//                var userTools = activeProject.userTool; //These are tools chosen by the project creator for users to have access to.  They may not be iframe tools.
////                $.each(userTools, function(){
////                    
////                });
//            }
//        });
//    }
    
    /* Populate the split page for Text Preview.  These are the transcription lines' text. */
    function createPreviewPages(){  
       // console.log("Creating preview pages");
        $(".previewPage").remove();
        var noLines = true;
        var pageLabel = "";
        for(var i = 0; i<transcriptionFolios.length; i++){
            var currentFolioToUse = transcriptionFolios[i];
            pageLabel = currentFolioToUse.label;
            var currentOn = currentFolioToUse["@id"];
            var currentPage = "";
            if(i===0){
                currentPage = "currentPage";
            }
           var lines = [];
           if(currentFolioToUse.resources && currentFolioToUse.resources.length > 0){
               lines = currentFolioToUse.resources;
                populatePreview(lines, pageLabel, currentPage, i);    
           }
           else{
               if(currentFolioToUse.otherContent && currentFolioToUse.otherContent.length === 1){
                    lines = currentFolioToUse.otherContent[0].resources;
                    pageLabel = currentFolioToUse.label;
                    populatePreview(lines, pageLabel, currentPage, i);    
                }
                else{
                    //This is no longer a case we need to handle
                    //console.log("Gotta get annos on " + currentOn);
                    //gatherAndPopulate(currentOn, pageLabel, currentPage, i);                   
                }
           }

        }
    }
    
    /* Gather the annotations for a canvas and populate the preview interface with them. */
    function gatherAndPopulate(currentOn, pageLabel, currentPage, i){
        //console.log("get annos on "+currentOn);
        var annosURL = "getAnno";
        var properties = {"@type": "sc:AnnotationList", "on" : currentOn};
        var paramOBJ = {"content": JSON.stringify(properties)};
         $.post(annosURL, paramOBJ, function(annoList){
            try{
                annoList = JSON.parse(annoList);
            }
            catch(e){ //dont kill it here
                  console.warn("I could not gather and populate for the preview pages.");
//                $("#transTemplateLoading p").html("Something went wrong. We could not get the annotation data FOR THE PREVIEW MODULE.  Refresh the page to try again.");
//                $('.transLoader img').attr('src',"images/missingImage.png");
//                $(".trexHead").show();
//                $("#genericIssue").show(1000);
//                return false;                
            }
             
            if(annoList.length > 0){
                checkForMaster(annoList, pageLabel, currentPage, i);
            }

         });
    }
    
    /* Check for which annotation list to use either by project ID or if its the master */
    function checkForMaster(annoList, pageLabel, currentPage, j){
        var lines = [];
        var masterList = undefined;
        for(var i=0; i<annoList.length; i++){
            var thisList = annoList[i];
            if(thisList.proj === "master"){
                //console.log("master");
                masterList = thisList; //The last list happens to be the master list, so set it.
            }
            if(thisList.proj !== undefined && thisList.proj == theProjectID){
               //console.log("proj == "+theProjectID);
               if(thisList.resources !== undefined){
                   if(thisList.resources.length > 0){ //can be an empty list.
                       lines = thisList.resources;
                   }
                   populatePreview(lines, pageLabel, currentPage, j);
                   return false;
               }
            }
            else if(lines.length===0 && i===annoList.length-1){
                //console.log("must default to master");
                if(masterList !== undefined){
                    lines = masterList.resources;
                    //TODO we do not want a user who is not an admin to alter this list.  A general user could end up being able to edit the master list.
                    populatePreview(lines, pageLabel, currentPage, j);
                }
                else{
                 //   console.log("No matching list by projectID and no master found for "+pageLabel);
                }                
                return false;
            }
        }
    }
    
    /* Populate the line preview interface. */
    function populatePreview(lines, pageLabel, currentPage, order){
        var letterIndex = 0;
        var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var previewPage = $('<div order="'+order+'" class="previewPage"><span class="previewFolioNumber">'+pageLabel+'</span></div>');
        if(lines.length === 0) previewPage = $('<div order="'+order+'" class="previewPage"><span class="previewFolioNumber">'+pageLabel+'</span><br>No Lines</div>');
        var num = 0;
        for(var j=0; j<lines.length; j++){
            num++;
            var goodLine = true;
            var col = letters[letterIndex];
            var currentLine = lines[j].on;
            var currentLineXYWH = currentLine.slice(currentLine.indexOf("#xywh=")+6);
            currentLineXYWH = currentLineXYWH.split(",");
            var currentLineX = currentLineXYWH[0];
            var line = lines[j];
            var lineURL = line["@id"];
            var lineID = lineURL; //lineURL.slice(lineURL.indexOf("/line/")+6)
            var lineText = line.resource["cnt:chars"];
            if(line.on.indexOf("#xywh") === -1){
                goodLine = false;
            }
            if(j>=1){
                var lastLine = lines[j-1].on;
                var lastLineXYWH = lastLine.slice(lastLine.indexOf("#xywh=")+6);
                lastLineXYWH = lastLineXYWH.split(",");
                var lastLineX = lastLineXYWH[0];
                var abs = Math.abs(parseInt(lastLineX) - parseInt(currentLineX));
                if(lastLine.indexOf("#xywh") === -1){
                    goodLine = false;
                }
                if(abs > 0 && goodLine){
                    letterIndex++;
                    num = 1;
                    col = letters[letterIndex];
                }
            }
            if(goodLine){
                var previewLine = $('<div class="previewLine">\n\
                         <span class="previewLineNumber" lineserverid="'+lineID+'" data-column="'+col+'" >\n\
                            '+col+''+num+'\n\
                          </span>\n\
                         <span class="previewText '+currentPage+'">'+lineText+'<span class="previewLinebreak"></span></span>\n\
                         <span class="previewNotes" contentEditable="(permitModify||isMember)" ></span>\n\
                     </div>');
                previewPage.append(previewLine);
            }
            else{
                num--;
            }
        }
        $(".previewPage[order='"+order+"']").remove();
        if(parseInt(order) > 0){
            var afterOrder = parseInt(order)-1;
            $(".previewPage[order='"+afterOrder+"']").after(previewPage);
        }
        else{
            $("#previewDiv").prepend(previewPage);
        }
    }
    
    function populateSpecialCharacters(specialCharacters){
        try{
            specialCharacters = JSON.parse(specialCharacters);
        }
        catch(e){ //dont kill it here
            $("#transTemplateLoading p").html("Something went wrong. We could not get the special characters.  Refresh the page to try again.");
            console.warn("I could not parse special chars.");
//            $('.transLoader img').attr('src',"images/missingImage.png");
//            $(".trexHead").show();
//            $("#genericIssue").show(1000);
            return false;                
        }
        var speCharactersInOrder = new Array(specialCharacters.length);
        if(!specialCharacters || specialCharacters.length === 0 || specialCharacters[0] === "[]"){
            $("#toggleXML").hide();
        }
        for (var char = 0; char < specialCharacters.length; char++){
            var thisChar = specialCharacters[char];
            if (thisChar == ""){ }
            else {
                var keyVal = thisChar.key;
                var position2 = parseInt(thisChar.position);
                var newCharacter = "<div class='character lookLikeButtons' onclick='addchar(\"&#" + keyVal + "\")'>&#" + keyVal + ";</div>";
                if (position2 - 1 >= 0 && (position2 - 1) < specialCharacters.length) {
                    //speCharactersInOrder[position2 - 1] = newCharacter;
                    speCharactersInOrder[char] = newCharacter;
                }
                else{
                    speCharactersInOrder[char] = newCharacter;
                    //Something is wrong with the position value, do your best.
                }
            }
        }
        for (var char2 = 0; char2 < speCharactersInOrder.length; char2++){
            var textButton = speCharactersInOrder[char2];
            var button1 = $(textButton);
            $(".specialCharacters").append(button1);
        }
    }

    function populateXML(xmlTags){
        try{
            xmlTags = JSON.parse(xmlTags);
        }
        catch(e){ //may not need to do this here
            $("#transTemplateLoading p").html("Something went wrong. We could not get the information about the XML tags for this project.  Refresh the page to try again.");
//            $('.transLoader img').attr('src',"images/missingImage.png");
//            $(".trexHead").show();
//            $("#genericIssue").show(1000);
                console.warn("I could not parse XML.");

            return false;                
        }
        var tagsInOrder = [];
        if(!xmlTags || xmlTags.length === 0 || xmlTags[0] === "[]"){
            $("#toggleXML").hide();
        }
        for (var tagIndex = 0; tagIndex < xmlTags.length; tagIndex++){
            var newTagBtn = "";
            var tagName = xmlTags[tagIndex].tag;
            if(tagName && tagName!== "" && tagName !== " "){
                var fullTag = "<"+tagName+" ";
                var xmlTagObject = xmlTags[tagIndex];
                var parametersArray = xmlTagObject.parameters; //This is a string array of properties, paramater1-parameter5 out of the db.
                if(parametersArray){
                    if (parametersArray[0] != null) {
                        fullTag += " " + parametersArray[0];
                    }
                    if (parametersArray[1] != null) {
                       fullTag += " " + parametersArray[1];
                    }
                    if (parametersArray[2] != null) {
                       fullTag += " " + parametersArray[2];
                    }
                    if (parametersArray[3] != null) {
                       fullTag += " " + parametersArray[3];
                    }
                    if (parametersArray[4] != null) {
                       fullTag += " " + parametersArray[4];
                    }
                    
                }
                fullTag += ">";
                var description = xmlTagObject.description;
                if(description == undefined || description == ""){
                    description = tagName;
                }
                newTagBtn = "<div onclick=\"insertAtCursor('"+tagName+"', '', '" + fullTag + "',false);\" class='xmlTag lookLikeButtons' title='" + fullTag + "'>" + description + "</div>"; //onclick=\"insertAtCursor('" + tagName + "', '', '" + fullTag + "');\">
                var button = $(newTagBtn);
                $(".xmlTags").append(button);
            }
        }
    }
    
    /* Display a message to the user letting them know the project will take a long time to load. */
    function longLoad(){
        var newMessage = "This project is large and may take a long time to load.  A message will appear here if there is an error.  This may take up to 10 minutes.  Thank you for your patience.";
        $("#transTemplateLoading p").html(newMessage);
    }

    /*
     * Load transcription interface from the text in the text area. 
     */
    function loadTranscription(){
        //Object validation here.
            projectID = 4080;
            var userTranscription = $('#transcriptionText').val();
            var pageToLoad = getURLVariable("p");
            currentFolio = 1;
            longLoadingProject = window.setTimeout(function(){
                longLoad();
            }, 25000);
            $("#transTemplateLoading").show();
            if($.isNumeric(userTranscription)){ //The user can put the project ID in directly and a call will be made to newberry proper to grab it.
                projectID = userTranscription;
                theProjectID = projectID;
                updateURL("");
                var url = "getProjectTPENServlet?projectID="+projectID;
                $.ajax({
                    url: url,
                    type:"GET",
                    success: function(activeProject){
                        var projectTools = activeProject.projectTool;
                        var count = 0;
                        var url  = ""; 
                        var currentUser = activeProject.cuser;
                        var leaders = activeProject.ls_leader;
                        tpenFolios = activeProject.ls_fs;
                        try{
                            projectTools = JSON.parse(projectTools);
                        }
                        catch(e){ //may not need to do this here
                            console.warn("I could not get project tools...reload to try again");
                            //$(".trexHead").show();
                            //$("#genericIssue").show(1000);
                            //return false;                
                        }
                        try{
                            leaders = JSON.parse(leaders);
                        }
                        catch(e){ //may not need to do this here
                            $("#transTemplateLoading p").html("Something went wrong. We could not get the information about the leader for this project.  Refresh the page to try again.");
                            $('.transLoader img').attr('src',"images/missingImage.png");
                            console.warn("I could not leaders of the project.");

                            //$(".trexHead").show();
                            //$("#genericIssue").show(1000);
                            //return false;                
                        }
                        try{
                            tpenFolios = JSON.parse(tpenFolios);
                        }
                        catch(e){ //may not need to do this here
                            $("#transTemplateLoading p").html("Something went wrong. We could not get the information about the folios for this project.  Refresh the page to try again.");
                            $('.transLoader img').attr('src',"images/missingImage.png");
                            console.warn("I could not parse folios.");

                            //$(".trexHead").show();
                            //$("#genericIssue").show(1000);
                            //return false;                
                        }
                        $.each(leaders, function(){
                            if(this.UID === parseInt(currentUser)){
                                //console.log("This user is a leader.");
                                userIsAdmin = true;
                                $("#parsingBtn").show();
                                var message = $('<span>This canvas has no lines.  If you would like to create lines</span> <span style="color: blue;" onclick="hideWorkspaceForParsing()">click here</span>.\n\
                                Otherwise, you can <span style="color: red;" onclick="$(\'#noLineWarning\').hide()">dismiss this message</span>.');
                                $("#noLineConfirmation").empty();
                                $("#noLineConfirmation").append(message);
                            }
                        });
                        if(activeProject.manifest !== undefined && activeProject.manifest !== ""){
//                            var getURLfromThis = activeProject.ls_ms;
//                            try{
//                                getURLfromThis = JSON.parse(getURLfromThis);
//                            }
//                            catch(e){ //may not need to do this here
//                                $("#transTemplateLoading p").html("Something went wrong. We could not get the manifest from the TPEN data.  Refresh the page to try again.");
//                                $('.transLoader img').attr('src',"images/missingImage.png");
//                                //$(".trexHead").show();
//                                //$("#genericIssue").show(1000);
//                                return false;                
//                            }
                            
                            /*BH Note:  
                            This is unreliable.  version.properties CREATE_PROJECT_RETURN_DOMAIN must be set to the correct current domain of the application
                            The CreateProject and CopyProject servlets must also respect this when creating the project for the first time when storing it to the archive property.
                            What if we always asked for it via /project/projectID no matter what?
                            I made this change, if we notice problems on UTL side, this is a possible spot.
                            */
                            //url  = getURLfromThis[0].archive; //This is the manifest inside the project data.  It refers to (most likely) an external manifest
                            //url = "project/"+projectID;
//                            if(url.indexOf("http") < 0){ //then there is no external manifest or it is one we cannot get
//                                url = "project/"+projectID; //ask for it internally through the application instead
//                            }
                            //$.ajax({ /* Causes CORS */
                                //url: url,
                                //success: function(projectData){
//                                    //console.log("Manifest data: ");
//                                    //console.log(projectData);
                            var projectData = "";
                            try{
                                projectData = JSON.parse(activeProject.manifest);
                            }
                            catch(e){
                                $("#transTemplateLoading p").html("Something went wrong. We could not parse the manifest data.  Refresh the page to try again.");
                                $('.transLoader img').attr('src',"images/missingImage.png");
                                console.warn("I could not parse project data.");

                                //$(".trexHead").show();
                                //$("#genericIssue").show(1000);
                                return false;                
                            }
                                    
                                if(projectData.sequences[0] !== undefined && projectData.sequences[0].canvases !== undefined
                                    && projectData.sequences[0].canvases.length > 0){
                                        transcriptionFolios = projectData.sequences[0].canvases;
                                        if(pageToLoad){
                                            $.each(tpenFolios, function(i){
                                                if(this.folioNumber === parseInt(pageToLoad)){
                                                    currentFolio = i + 1;
                                                    return true;
                                                }
                                            });
                                        }
                                        scrubFolios();
                                        var count = 1;
                                        $.each(transcriptionFolios, function(){
                                            $("#pageJump").append("<option folioNum='"+count+"' class='folioJump' val='"+this.label+"'>"+this.label+"</option>");
                                            $("#compareJump").append("<option class='compareJump' folioNum='"+count+"' val='"+this.label+"'>"+this.label+"</option>");
                                            count++;
                                            if(this.otherContent){
                                                if(this.otherContent.length > 0){
                                                    annoLists.push(this.otherContent[0]);
                                                }
                                                else{
                                                    //console.log("push empty 1");
                                                    //otherContent was empty (IIIF says otherContent should have URI's to AnnotationLists).  We will check the store for these lists still.
                                                    annoLists.push("empty");
                                                }
                                            }
                                            else{
                                                annoLists.push("noList");
                                            }
                                        });
                                        loadTranscriptionCanvas(transcriptionFolios[currentFolio - 1],"");
                                        var projectTitle = projectData.label;
                                        $("#trimTitle").html(projectTitle);
                                        $("#trimTitle").attr("title", projectTitle);
                                        
                                        $('#transcriptionTemplate').css("display", "inline-block");
                                        $('#setTranscriptionObjectArea').hide();
                                        $(".instructions").hide();
                                        $(".hideme").hide();
                                        //load Iframes after user check and project information data call    
                                        loadIframes();
                                        //getProjectTools(projectID);
                                        createPreviewPages();
                                    }
                                    else{
                                        $("#transTemplateLoading p").html("Something went wrong. We could not get the sequence from the manifest.  Refresh the page to try again.");
                                        $('.transLoader img').attr('src',"images/missingImage.png");
                                                    console.warn("I could not find a manifest sequence.");

                                        //$(".trexHead").show();
                                        //$("#genericIssue").show(1000);
                                        return false;               
                                    }
                                //},
                                //error: function(jqXHR,error, errorThrown) {  
                                clearTimeout(longLoadingProject);
                                //$("#transTemplateLoading p").html("Something went wrong. We could not get the manifest data.  Refresh the page to try again.");
                                //$('.transLoader img').attr('src',"images/missingImage.png");
                                //alert("Something went wrong. Could not get the project. 1");
                                //load Iframes after user check and project information data call    
                                //loadIframes();
                               //}
                            //});
                        }
                        else{
                            clearTimeout(longLoadingProject);
                            $("#transTemplateLoading p").html("We could not get the manfiest assosiated with this project.  Refresh the page to try again.");
                            $('.transLoader img').attr('src',"images/missingImage.png");
                        }
                        populateSpecialCharacters(activeProject.projectButtons);
                        populateXML(activeProject.xml);
                        if(projectTools.length && projectTools!=="[]"){
                            $.each(projectTools, function(){
                                if(count < 4){ //allows 5 tools.  
                                    var splitHeight = window.innerHeight + "px";
                                    var toolLabel = this.name;
                                    var toolSource = this.url;
                                    var splitTool = $('<div toolName="'+toolLabel+'" class="split iTool"><button class="fullScreenTrans">Full Screen Transcription</button></div>');
                                    var splitToolIframe = $('<iframe style="height:'+splitHeight+';" src="'+toolSource+'"></iframe>');
                                    var splitToolSelector = $('<option splitter="'+toolLabel+'" class="splitTool">'+toolLabel+'</option>');
                                    splitTool.append(splitToolIframe);
                                    $("#splitScreenTools").append(splitToolSelector);
                                    $(".iTool:last").after(splitTool);
                                }
                                count++;
                            });
                        }
                    },
                    error: function(jqXHR,error, errorThrown) {  
                        clearTimeout(longLoadingProject);
                        $("#transTemplateLoading p").html("We could not get the the project data.  Refresh the page to try again.  Contact the admin if you continue to see this message.");
                        $('.transLoader img').attr('src',"images/missingImage.png");
                    }
                });
                }
                else if(isJSON(userTranscription)){
                    try{
                        userTranscription = JSON.parse(userTranscription);
                    }
                    catch(e){ //may not need to do this here
                        $("#transTemplateLoading p").html("Something went wrong. The data for this object is not proper JSON.  Resubmit or refresh the page to try again.");
                        $('.transLoader img').attr('src',"images/missingImage.png");
                                    console.warn("I could not parse user json input.");

                        //$(".trexHead").show();
                        //$("#genericIssue").show(1000);
                        return false;                
                    }
                    if(userTranscription.sequences[0] !== undefined && userTranscription.sequences[0].canvases !== undefined
                        && userTranscription.sequences[0].canvases.length > 0){
                            transcriptionFolios = userTranscription.sequences[0].canvases;
                            scrubFolios();
                            var count = 1;
                            $.each(transcriptionFolios, function(){
                               $("#pageJump").append("<option folioNum='"+count+"' class='folioJump' val='"+this.label+"'>"+this.label+"</option>");
                               $("#compareJump").append("<option class='compareJump' folioNum='"+count+"' val='"+this.label+"'>"+this.label+"</option>");
                               count++;
                                if(this.otherContent){
                                    if(this.otherContent.length > 0){
                                        annoLists.push(this.otherContent[0]);
                                    }
                                    else{
                                        //console.log("push empty 2");
                                        //otherContent was empty (IIIF says otherContent should have URI's to AnnotationLists).  We will check the store for these lists still.
                                        annoLists.push("empty");
                                    }
                                }
                                else{
                                    annoLists.push("noList");
                                }
                            });
                            loadTranscriptionCanvas(transcriptionFolios[0],"");
                            var projectTitle = userTranscription.label;
                            $("#trimTitle").html(projectTitle);
                            $("#trimTitle").attr("title", projectTitle);
                            $('#transcriptionTemplate').css("display", "inline-block");
                            $('#setTranscriptionObjectArea').hide();
                            $(".instructions").hide();
                            $(".hideme").hide();
                            //load Iframes after user check and project information data call    
                            loadIframes();
                            createPreviewPages();
                        }
                        else{
                            //ERROR!  It is a valid JSON object, but it is malformed and cannot be read as a transcription object.
                            //load Iframes after user check and project information data call    
                            loadIframes();
                        }
                        
                }
                else if (userTranscription.indexOf("http://") >= 0 || userTranscription.indexOf("https://") >= 0){
                    var localProject = false;
                    if(userTranscription.indexOf("/project/") > -1){
                        if(userTranscription.indexOf("t-pen.org") > -1){
                            localProject = false;
                            projectID = 0;  //This way, it will not grab the t-pen project id.  
                        }
                        else{
                            localProject = true; //Well, probably anyway.  I forsee this being an issue like with t-pen.
                            projectID = parseInt(userTranscription.substring(userTranscription.lastIndexOf('/project/')+9));
                            theProjectID = projectID;
                        }
                    }
                    else{
                        projectID = 0;
                    }
                    if(localProject){
                        //get project info first, get manifest out of it, populate
                        updateURL("");
                        var url = "getProjectTPENServlet?projectID="+projectID;
                        $.ajax({
                            url: url,
                            type:"GET",
                            success: function(activeProject){
                                var projectTools = activeProject.projectTool;
                                var currentUser = activeProject.cuser;
                                var leaders = activeProject.ls_leader;
                                tpenFolios = activeProject.ls_fs;
                                try{
                                    leaders = JSON.parse(leaders);
                                }
                                catch(e){ //may not need to do this here
                                    $("#transTemplateLoading p").html("Something went wrong. We could not get the information about the leader for this project.  Refresh the page to try again.");
                                    $('.transLoader img').attr('src',"images/missingImage.png");
                                                console.warn("I could not parse leaders.");

                                    //$(".trexHead").show();
                                    //$("#genericIssue").show(1000);
                                    //return false;                
                                }
                                try{
                                    tpenFolios = JSON.parse(tpenFolios);
                                }
                                catch(e){ //may not need to do this here
                                    $("#transTemplateLoading p").html("Something went wrong. We could not get the information about the folios for this project.  Refresh the page to try again.");
                                    $('.transLoader img').attr('src',"images/missingImage.png");
                                                console.warn("I could not parse folios.");

                                    //$(".trexHead").show();
                                    //$("#genericIssue").show(1000);
                                    //return false;                
                                }
                                $.each(leaders, function(){
                                    if(this.UID === parseInt(currentUser)){
                                        //console.log("This user is a leader.");
                                        userIsAdmin = true;
                                        $("#parsingBtn").show();
                                        var message = $('<span>This canvas has no lines.  If you would like to create lines</span> <span style="color: blue;" onclick="hideWorkspaceForParsing()">click here</span>.\n\
                                        Otherwise, you can <span style="color: red;" onclick="$(\'#noLineWarning\').hide()">dismiss this message</span>.');
                                        $("#noLineConfirmation").empty();
                                        $("#noLineConfirmation").append(message);
                                    }
                                });
                                var count = 0;
                                var url  = "";
                                if(activeProject.manifest !== undefined && activeProject.manifest !== ""){
//                                    var getURLfromThis = activeProject.ls_ms;
//                                    try{
//                                        getURLfromThis = JSON.parse(getURLfromThis);
//                                    }
//                                    catch(e){ //may not need to do this here
//                                        $("#transTemplateLoading p").html("Something went wrong. We could not get the manifest out of the TPEN data for this project.  Refresh the page to try again.");
//                                        $('.transLoader img').attr('src',"images/missingImage.png");
//                                        //$(".trexHead").show();
//                                        //$("#genericIssue").show(1000);
//                                        return false;                
//                                    }
                                    
                                    //url  = getURLfromThis[0].archive;
                                    //$.ajax({
                                        //url: url,
                                        //success: function(projectData){
                                        var projectData = ""
                                        try{
                                        projectData = JSON.parse(activeProject.manifest);;
                                        }
                                        catch(e){ //may not need to do this here
                                            $("#transTemplateLoading p").html("Something went wrong. We could not get the manifest out of the TPEN data for this project.  Refresh the page to try again.");
                                            $('.transLoader img').attr('src',"images/missingImage.png");
                                                        console.warn("I could get parse a manifest object.");

                                            //$(".trexHead").show();
                                            //$("#genericIssue").show(1000);
                                            return false;                
                                        }
                                        if(projectData.sequences[0] !== undefined && projectData.sequences[0].canvases !== undefined
                                            && projectData.sequences[0].canvases.length > 0){
                                                transcriptionFolios = projectData.sequences[0].canvases;
                                                if(pageToLoad){
                                                    $.each(tpenFolios, function(i){
                                                        if(this.folioNumber === parseInt(pageToLoad)){
                                                            currentFolio = i + 1;
                                                            return true;
                                                        }
                                                    });
                                                }
                                                scrubFolios();
                                                var count = 1;

                                                $.each(transcriptionFolios, function(){
                                                    $("#pageJump").append("<option folioNum='"+count+"' class='folioJump' val='"+this.label+"'>"+this.label+"</option>");
                                                    $("#compareJump").append("<option class='compareJump' folioNum='"+count+"' val='"+this.label+"'>"+this.label+"</option>");
                                                    count++;
                                                    if(this.otherContent){
                                                        if(this.otherContent.length > 0){
                                                            annoLists.push(this.otherContent[0]);
                                                        }
                                                        else{
                                                            //console.log("push empty 3");
                                                            //otherContent was empty (IIIF says otherContent should have URI's to AnnotationLists).  We will check the store for these lists still.
                                                            annoLists.push("empty");
                                                        }
                                                    }
                                                    else{
                                                        annoLists.push("noList");
                                                    }
                                                });
                                                loadTranscriptionCanvas(transcriptionFolios[currentFolio - 1],"");
                                                var projectTitle = projectData.label;
                                                $("#trimTitle").html(projectTitle);
                                                $("#trimTitle").attr("title", projectTitle);$('#transcriptionTemplate').css("display", "inline-block");
                                                $('#setTranscriptionObjectArea').hide();
                                                $(".instructions").hide();
                                                $(".hideme").hide(); 
                                                //getProjectTools(projectID);
                                                //load Iframes after user check and project information data call    
                                                loadIframes();
                                                createPreviewPages();
                                            }
                                            else{
                                                //ERROR! It is a malformed transcription object.  There is no canvas sequence defined.  
                                                //load Iframes after user check and project information data call    
                                                loadIframes();
                                            }
                                        //},
//                                        error: function(jqXHR,error, errorThrown) {  
//                                            clearTimeout(longLoadingProject);
//                                            $("#transTemplateLoading p").html("We could not get project data.  Refresh the page to try again.");
//                                            $('.transLoader img').attr('src',"images/missingImage.png");
//                                            //load Iframes after user check and project information data call    
//                                            loadIframes();
//                                       }
                                //});
                            }
                            else{
                                clearTimeout(longLoadingProject);
                                $("#transTemplateLoading p").html("We could not get the manfiest assosiated with this project.  Refresh the page to try again.");
                                $('.transLoader img').attr('src',"images/missingImage.png");
                                //load Iframes after user check and project information data call    
                                loadIframes();
                            }
                            populateSpecialCharacters(activeProject.projectButtons);
                            populateXML(activeProject.xml);
                            $.each(projectTools, function(){
                                if(count < 4){ //allows 5 tools.  
                                    var splitHeight = window.innerHeight + "px";
                                    var toolLabel = this.name;
                                    var toolSource = this.url;
                                    var splitTool = $('<div toolName="'+toolLabel+'" class="split iTool"><button class="fullScreenTrans">Full Screen Transcription</button></div>');
                                    var splitToolIframe = $('<iframe style="height:'+splitHeight+';" src="'+toolSource+'"></iframe>');
                                    var splitToolSelector = $('<option splitter="'+toolLabel+'" class="splitTool">'+toolLabel+'</option>');
                                    splitTool.append(splitToolIframe);
                                    $("#splitScreenTools").append(splitToolSelector);
                                    $(".iTool:last").after(splitTool);
                                }
                                count++;
                            });
                            //createPreviewPages();
                        },
                        error: function(jqXHR,error, errorThrown) {  
                                    clearTimeout(longLoadingProject);
                                    $("#transTemplateLoading p").html("We could not get project data.  Refresh the page to try again.  Contact the admin if you continue to see this message.");
                                    $('.transLoader img').attr('src',"images/missingImage.png");
                            }
                    });
                    }
                    else{ //it is not a local project, so just grab the url that was input and request the manifst. 
                        var url  = userTranscription;
                        $.ajax({
                            url: url,
                            success: function(projectData){
                                if(projectData.sequences[0] !== undefined && projectData.sequences[0].canvases !== undefined
                                && projectData.sequences[0].canvases.length > 0){
                                    transcriptionFolios = projectData.sequences[0].canvases;
                                    scrubFolios();
                                    var count = 1;

                                    $.each(transcriptionFolios, function(){
                                        $("#pageJump").append("<option folioNum='"+count+"' class='folioJump' val='"+this.label+"'>"+this.label+"</option>");
                                        $("#compareJump").append("<option class='compareJump' folioNum='"+count+"' val='"+this.label+"'>"+this.label+"</option>");
                                        count++;
                                        if(this.otherContent){
                                            if(this.otherContent.length > 0){
                                                annoLists.push(this.otherContent[0]);
                                            }
                                            else{
                                                //console.log("push empty 4");
                                                //otherContent was empty (IIIF says otherContent should have URI's to AnnotationLists).  We will check the store for these lists still.
                                                annoLists.push("empty");
                                            }
                                        }
                                        else{
                                            annoLists.push("noList");
                                        }
                                    });
                                    loadTranscriptionCanvas(transcriptionFolios[0],"");
                                    
                                    var projectTitle = projectData.label;
                                    $("#trimTitle").html(projectTitle);
                                    $("#trimTitle").attr("title", projectTitle);$('#transcriptionTemplate').css("display", "inline-block");
                                    $('#setTranscriptionObjectArea').hide();
                                    $(".instructions").hide();
                                    $(".hideme").hide(); 
                                    createPreviewPages();
                                    //getProjectTools(projectID);
                                }
                                else{
                                    //ERROR! It is a malformed transcription object.  There is no canvas sequence defined.  
                                }
                                //load Iframes after user check and project information data call    
                                loadIframes();
                                
                            },
                            error: function(jqXHR,error, errorThrown) {  
                                clearTimeout(longLoadingProject);
                                $("#transTemplateLoading p").html("We could not load this JSON object.  Check it in a validator and try again.");
                                $('.transLoader img').attr('src',"images/missingImage.png");
                                //load Iframes after user check and project information data call    
                                loadIframes();
                           }
                        });
                    }
                }
                else{
                    clearTimeout(longLoadingProject);
                    $("#transTemplateLoading p").html("The input was invalid.  Make sure you are asking for a Manifest a proper way.  Refresh to try again.");
                    $('.transLoader img').attr('src',"images/missingImage.png");
                    //load Iframes after user check and project information data call.  Maybe only after valid page load parameters.  uncomment this line if necessary.    
                    //loadIframes();
                }
            
    } 
    
    /*
     * Load a canvas from the manifest to the transcription interface. 
     */
    function loadTranscriptionCanvas(canvasObj, parsing){
        $("#minimalLines").removeClass("selected");
        minimalLines = false;
        $("#showTheLines").addClass("selected");
        $("#showTheLabels").addClass("selected");
        var noLines = true;
        var canvasAnnoList = "";
        $("#imgTop, #imgBottom").css("height", "0px");
        $("#imgTop img, #imgBottom img").css("height", "0px");
        $("#imgTop img, #imgBottom img").css("width", "auto");
        $("#prevColLine").html("**");
        $("#currentColLine").html("**");
        //$('.transcriptionImage').attr('src', "images/loading2.gif"); //background loader if there is a hang time waiting for image
        $('.lineColIndicator').remove();
        $(".transcriptlet").remove();
        var pageTitle = canvasObj.label;
        $("#trimPage").html(pageTitle);
        $("#trimPage").attr("title", pageTitle);
        $("option[val='"+pageTitle+"']").prop("selected", true).attr("selected",true);
        $('#transcriptionTemplate').css("display", "inline-block");
        $("#parsingBtn").css("box-shadow", "none");
        $("#parsingButton").removeAttr('disabled');
        $(".lineColIndicator").css({
            "box-shadow": "rgba(255, 255, 255, 0.4)",
            "border": "1px solid rgb(255, 255, 255)"
        });
        $(".lineColOnLine").css({
            "border-left": "1px solid rgba(255, 255, 255, 0.2);",
            "color": "rgb(255, 255, 255)"
        });
        //Move up all image annos
        var cnt = -1;

        if(canvasObj.images[0].resource['@id'] !== undefined && canvasObj.images[0].resource['@id'] !== ""){ //Only one image
            var image = new Image();
            var origImageURL = canvasObj.images[0].resource['@id'].replace('amp;','');
            var largerImageURL = origImageURL.replace("/2000", "/3500"); //By default, they server out at height 2000.  Try to get a better image up front at 3000
            //Ex. https://iiif.library.utoronto.ca/v2/paleography:2083/full/2000,/0/default.jpg
            $(image)
                    .on("load",function() {
                        $("#transTemplateLoading").hide();
                        $("#imgTop, #imgTop img, #imgBottom img, #imgBottom, #transcriptionCanvas").css("height", "auto");
                        $("#imgTop img, #imgBottom img").css("width", "100%");
                        $("#imgBottom").css("height", "inherit");
                        $('.transcriptionImage').attr('src', canvasObj.images[0].resource['@id'].replace('amp;',''));
                        $("#fullPageImg").attr("src", canvasObj.images[0].resource['@id'].replace('amp;',''));
                        originalCanvasHeight2 = $("#imgTop img").height();
                        originalCanvasWidth2 = $("#imgTop img").width();
                        originalCanvasHeight = $("#imgTop img").height();; //make sure these are set correctly
                        originalCanvasWidth = $("#imgTop img").width(); //make sure these are set correctly
                        drawLinesToCanvas(canvasObj, parsing);
                        populateCompareSplit(currentFolio);
                        $("#transcriptionCanvas").attr("canvasid", canvasObj["@id"]);
                        $("#transcriptionCanvas").attr("annoList", canvasAnnoList);
                        $("#parseOptions").find(".tpenButton").removeAttr("disabled");
                        $("#parsingBtn").removeAttr("disabled");
                    })
                    .on("error", function(){
                        var image2 = new Image();
                        $(image2)
                        .on("load", function(){
                            $("#noLineWarning").hide();
                            $("#imgTop, #imgTop img, #imgBottom img, #imgBottom, #transcriptionCanvas").css("height", "auto");
                            $("#imgTop img, #imgBottom img").css("width", "100%");
                            $('.transcriptionImage').attr('src', "images/missingImage.png");
                            $("#fullPageImg").attr("src", "images/missingImage.png");
                            $('#transcriptionCanvas').css('height', $("#imgTop img").height() + "px");
                            $('.lineColIndicatorArea').css('height', $("#imgTop img").height() + "px");
                            $("#imgTop").css("height", "0px");
                            $("#imgBottom img").css("top", "0px");
                            $("#imgBottom").css("height", "inherit"); 
                            $("#parsingButton").attr("disabled", "disabled");
                            alert("No image for this canvas or it could not be resolved.  Not drawing lines.");
                            $("#transTemplateLoading").hide();
                            $("#parseOptions").find(".tpenButton").attr("disabled", "disabled");
                            $("#parsingBtn").attr("disabled", "disabled");
                            clearTimeout(longLoadingProject);
                        })
                        .attr("src", "images/missingImage.png");
                    })
                    .attr("src", largerImageURL);
        }
        else{
             $('.transcriptionImage').attr('src',"images/missingImage.png");
             alert("The canvas is malformed.  No 'images' field in canvas object or images:[0]['@id'] does not exist.  Cannot draw lines.");
             $("#transTemplateLoading").hide();
             clearTimeout(longLoadingProject);
            //ERROR!  Malformed canvas object.  
        }
        $(".previewText").removeClass("currentPage");
        $.each($("#previewDiv").children(".previewPage:eq("+(parseInt(currentFolio)-1)+")").find(".previewLine"),function(){
            $(this).find('.previewText').addClass("currentPage");
        });
        
    }
    
      /*
     * @paran canvasObj  A canvas object to extrac transcription lines from and draw to the interface. Handles master project designation.
     */
    function drawLinesToCanvas(canvasObj, parsing){
        var lines = [];
        currentFolio = parseInt(currentFolio);
        //Clear any existing stuff.  
        $(".transcriptlet, .parsing, .line, .lineColdIndicator, .fullP").remove();
        //console.log("Draw lines");
//        //console.log(canvasObj);
        if(canvasObj.resources !== undefined && canvasObj.resources.length > 0){
//            //console.log("Lines are resource annos");
            for(var i=0; i<canvasObj.resources.length; i++){
                if(isJSON(canvasObj.resources[i])){   // it is directly an annotation
                    lines.push(canvasObj.resources[i]);
                }
            }
            linesToScreen(lines);
            $("#transTemplateLoading").hide();
            $("#transcriptionTemplate").show();
        }
        else if(canvasObj.otherContent && canvasObj.otherContent.length > 0){
            var annoList = transcriptionFolios[currentFolio-1].otherContent;
            var currentList = {};
            if(annoList.length > 0){
                //Always default to the master list, which was the first list created for the canvas.  That way, the annotation lists associated with the master are still supported.
                var masterList = {};
                //lines = masterList.resources;
                //currentList = masterList;
                //annoLists[currentFolio -1] = masterList["@id"];
                $.each(annoList, function(){
                    //if we find the master list, make that the default
                    if(this.proj === "master"){
                        //console.log("master set to default");
                        masterList = this;
                        lines = this.resources;
                        currentList = this;
                        //TODO we do not want someone who is not an admin to be able to edit this list.  Do a check here and make annoLists[currentFolio -1] = "master" so it cannot be written to.
                        annoLists[currentFolio -1] = this["@id"];
                        transcriptionFolios[currentFolio-1].otherContent[0] = this;
                    }
                    if(this.proj !== undefined && this.proj!=="" && this.proj == theProjectID){
                        //These are the lines we want to draw because the projectID matches.  Overwrite master if necessary.
                        //console.log("Lines we wanna draw");
                        lines = this.resources;
                        currentList = this;
                        annoLists[currentFolio -1] = this["@id"];
                        transcriptionFolios[currentFolio-1].otherContent[0] = this;
                        return false;
                    }
                    else{
                        //It is an annotation list for this canvas in a different project.  We have defaulted to master already.
                        //console.log("Anno list for this canvas but different project.  ");
                    }
                });
                if(lines.length > 0){
                    //console.log("Got lines to draw");
                    $("#transTemplateLoading").hide();
                    $("#transcriptionTemplate").show();
                    linesToScreen(lines);
                }
                else{ //list has no lines
                    //console.log("no lines in what we got");
                    if(parsing !== "parsing"){
                        $("#noLineWarning").show();
                        $("#captions").text("There are no lines for this canavs.");
                    }
                    $("#imgTop").css("height", "0%");
                    $("#transTemplateLoading").hide();
                    $("#transcriptionTemplate").show();
                    $('#transcriptionCanvas').css('height', $("#imgTop img").height() + "px");
                    $('.lineColIndicatorArea').css('height', $("#imgTop img").height() + "px");
                    $("#imgTop img").css("top", "0px");
                    $("#imgBottom").css("height", "inherit");
                    $("#parsingBtn").css("box-shadow", "0px 0px 6px 5px yellow");
                }
            }
            updateURL("p");
        }
        else{ //Double check in the store for the list.
                var annosURL = "getAnno";
                var onValue = canvasObj["@id"];
                //console.log("get annos for draw for canvas "+onValue);
                var properties = {"@type": "sc:AnnotationList", "on" : onValue};
                var paramOBJ = {"content": JSON.stringify(properties)};
                $.post(annosURL, paramOBJ, function(annoList){
                    //console.log("found annoLists");
                    try{
                        annoList = JSON.parse(annoList);
                    }
                    catch(e){ //may not need to do this here
                        $("#transTemplateLoading p").html("Something went wrong. The list of lines was not JSON.  Refresh the page to try again.");
                        $('.transLoader img').attr('src',"images/missingImage.png");
                        $(".trexHead").show();
                        $("#genericIssue").show(1000);
                        console.warn("I could not parse the anno list.");
                        return false;                
                    }
                    
                    //console.log(annoList);
                    var found = false;
                    var currentList = {};
                    if(annoList.length > 0){
                        //Always default to the master list, which was the first list created for the canvas.  That way, the annotation lists associated with the master are still supported.
                        var masterList = {};
                        //lines = masterList.resources;
                        //currentList = masterList;
                        //annoLists[currentFolio -1] = masterList["@id"];
                        $.each(annoList, function(){
                            //if we find the master list, make that the default
                            if(this.proj === "master"){
                                //console.log("master set to default");
                                masterList = this;
                                lines = this.resources;
                                currentList = this;
                                //TODO we do not want someone who is not an admin to be able to edit this list.  Do a check here and make annoLists[currentFolio -1] = "master" so it cannot be written to.
                                annoLists[currentFolio -1] = this["@id"];
                                transcriptionFolios[currentFolio-1].otherContent[0] = this;
                            }
                            if(this.proj !== undefined && this.proj!=="" && this.proj == theProjectID){
                                //These are the lines we want to draw because the projectID matches.  Overwrite master if necessary.
                                //console.log("Lines we wanna draw");
                                lines = this.resources;
                                currentList = this;
                                annoLists[currentFolio -1] = this["@id"];
                                transcriptionFolios[currentFolio-1].otherContent[0] = this;
                                return false;
                            }
                            else{
                                //It is an annotation list for this canvas in a different project.  We have defaulted to master already.
                                //console.log("Anno list for this canvas but different project.  ");
                            }
                        });
                        if(lines.length > 0){
                            //console.log("Got lines to draw");
                            $("#transTemplateLoading").hide();
                            $("#transcriptionTemplate").show();
                            linesToScreen(lines);
                        }
                        else{ //list has no lines
                            //console.log("no lines in what we got");
                            if(parsing !== "parsing"){
                                $("#noLineWarning").show();
                                $("#captions").text("There are no lines for this canavs.");
                            }
                            $("#imgTop").css("height", "0%");
                            $("#transTemplateLoading").hide();
                            $("#transcriptionTemplate").show();
                            $('#transcriptionCanvas').css('height', $("#imgTop img").height() + "px");
                            $('.lineColIndicatorArea').css('height', $("#imgTop img").height() + "px");
                            $("#imgTop img").css("top", "0px");
                            $("#imgBottom").css("height", "inherit");
                            $("#parsingBtn").css("box-shadow", "0px 0px 6px 5px yellow");
                        }
                    }
                    else{ // couldnt get list.  one should always exist, even if empty.  We will say no list and changes will be stored locally to the canvas.
                        annoLists[currentFolio -1 ] = "empty";
                         transcriptionFolios[currentFolio-1].otherContent[0] = {};
                        if(parsing !== "parsing"){
                            $("#noLineWarning").show();
                            $("#captions").text("There are no lines for this canavs.");
                        }
                        $("#transTemplateLoading").hide();
                        $("#transcriptionTemplate").show();
                        $('#transcriptionCanvas').css('height', $("#imgTop img").height() + "px");
                        $('.lineColIndicatorArea').css('height', $("#imgTop img").height() + "px");
                        $("#imgTop").css("height", "0%");
                        $("#imgBottom img").css("top", "0px");
                        $("#imgBottom").css("height", "inherit");
                        $("#parsingBtn").css("box-shadow", "0px 0px 6px 5px yellow");
                    }
                    updateURL("p");
                });
        }
        
    }
    
    /* Take line data, turn it into HTML elements and put them to the DOM */
    function linesToScreen(lines){
        $("#noLineWarning").hide();
        var letterIndex = 0;
        var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        letters = letters.split("");
        var update = true;
        if($("#parsingDiv").is(":visible")){
            update = false;
        }
        var thisContent = "";
        var thisPlaceholder = "Enter a line transcription";
        var counter = -1;
        var colCounter = 1;
        var image = $('#imgTop img');
        var theHeight = image.height();
        var theWidth = image.width();
        $('#transcriptionCanvas').css('height', originalCanvasHeight2 +"px");
        $('.lineColIndicatorArea').css('height',originalCanvasHeight2 + "px");
        var ratio = 0;
        //should be the same as originalCanvasWidth2/originalCanvasBeight2
        ratio = theWidth / theHeight;
        adjustRatio = ratio;
//        console.log("ratio for lines to screen");
//        console.log(theWidth + "/" +theHeight);
//        console.log(ratio);
        for(var i=0; i<lines.length;i++){
            //("line "+i);
            var goodLastLine = true;
            var line = lines[i];
            var lastLine = {};
            var col = letters[letterIndex];
            if(i>0){
                lastLine=lines[i-1];
                if(lastLine.on.indexOf("#xywh") === -1){
                    goodLastLine = false;
                }
            }
            var lastLineX = 10000;
            var lastLineWidth = -1;
            var lastLineTop = -2;
            var lastLineHeight = -2;
            var x,y,w,h = 0;
            var XYWHarray = [x,y,w,h];
            var lineURL = "";
            var lineID = -1;
            if(line.on !== undefined){
                lineURL = line.on;
            }
            else{
                //ERROR.  malformed line.
                update = false;
            }
            if(line["@id"] !== undefined && line["@id"]!=="" ){ //&& line['@id'].indexOf('annotationstore/annotation') >=0
                lineID = line['@id']; //.slice(line['@id'].lastIndexOf('line/') + 5)
            }
            else{
                //ERROR.  Malformed line. 
                update = false;
            }
            thisContent = "";
            if(lineURL.indexOf('#') > -1){ //current line string must contain this to be valid
                var XYWHsubstring = lineURL.substring(lineURL.lastIndexOf('#' + 1)); //xywh = 'x,y,w,h'
                if(lastLine.on){ //won't be true for first line
                    lastLineX = lastLine.on.slice(lastLine.on.indexOf("#xywh=") + 6).split(",")[0];
                    lastLineWidth = lastLine.on.slice(lastLine.on.indexOf("#xywh=") + 6).split(",")[2];
                    lastLineTop = lastLine.on.slice(lastLine.on.indexOf("#xywh=") + 6).split(",")[1];
                    lastLineHeight = lastLine.on.slice(lastLine.on.indexOf("#xywh=") + 6).split(",")[3];
                }                
                else if(i===0 && lines.length > 1){ /* Check for the variance with the first line */
                    lastLine = lines[0];
                     if(lastLine.on){
                         lastLineX = lastLine.on.slice(lastLine.on.indexOf("#xywh=") + 6).split(",")[0];
                         lastLineWidth = lastLine.on.slice(lastLine.on.indexOf("#xywh=") + 6).split(",")[2];
                         lastLineTop = lastLine.on.slice(lastLine.on.indexOf("#xywh=") + 6).split(",")[1];
                         lastLineHeight = lastLine.on.slice(lastLine.on.indexOf("#xywh=") + 6).split(",")[3];
                     }
                }
                if(XYWHsubstring.indexOf('=') > -1){ //string must contain this to be valid
                    var numberArray = XYWHsubstring.substring(lineURL.lastIndexOf('xywh=') + 5).split(',');
                    if(parseInt(lastLineTop) + parseInt(lastLineHeight) !== numberArray[1]){
                        //check for slight variance in top position.  Happens because of rounding percentage math that gets pixels to be an integer.
                        var num1 = parseInt(lastLineTop) + parseInt(lastLineHeight);
                        if(Math.abs(num1 - numberArray[1]) <= 4 && Math.abs(num1 - numberArray[1])!==0){
                            numberArray[1] = num1;
                            var newString = numberArray[0]+","+num1+","+numberArray[2]+","+numberArray[3];
                            if(i>0){
                                //to make the change cascade to the rest of the lines, we actually have to update the #xywh of the current line with the new value for y.
                                var lineOn = lineURL;
                                var index = lineOn.indexOf("#xywh=") + 6;
                                var newLineOn = lineOn.substr(0, index) + newString + lineOn.substr(index + newString.length);
                                lines[i].on = newLineOn;
                            }
                            
                        }
                        else{
                            //console.log("no difference");
                        }
                    }
                    if(numberArray.length === 4 && goodLastLine){ // string must have all 4 to be valid
                        x = numberArray[0];
                        w = numberArray[2];
                        if(lastLineX !== x){ //check if the last line's x value is equal to this line's x value (means same column)
                            if(goodLastLine){
                                if(Math.abs(x - lastLineX) <= 3){ //allow a 3 pixel  variance and fix this variance when necessary...
                                    //align them, call them the same Column. 
                                    /*
                                     * This is a consequence of #xywh for a resource needing to be an integer.  When I calculate its intger position off of
                                     * percentages, it is often a float and I have to round to write back.  This can cause a 1 or 2 pixel discrenpency, which I account
                                     * for here.  There may be better ways of handling this, but this is a good solution for now. 
                                     */
                                    if(lastLineWidth !== w){ //within "same" column (based on 3px variance).  Check the width
                                        if(Math.abs(w - lastLineWidth) <= 5){ //If the width of the line is within five pixels, automatically make the width equal to the last line's width.

                                            //align them, call them the same Column. 
                                            /*
                                             * This is a consequence of #xywh for a resource needing to be an integer.  When I calculate its intger position off of
                                             * percentages, it is often a float and I have to round to write back.  This can cause a 1 or 2 pixel discrenpency, which I account
                                             * for here.  There may be better ways of handling this, but this is a good solution for now. 
                                             */
                                            w = lastLineWidth;
                                            numberArray[2] = w;
                                        }
                                    }
                                    x = lastLineX;
                                    numberArray[0] = x;
                                }
                                else{ //we are in a new column, column indicator needs to increase. 
                                    if(lines.length > 1){ //only if we had a valid lastLine to do the comparison with should you trust this logic.
                                        letterIndex++;
                                        col = letters[letterIndex];
                                        colCounter = 1; //Reset line counter so that when the column changes the line# restarts?
                                    }
                                }
                            }
                        }
                        else{ //If the X value matches, we are in the same column and don't have to account for any variance or update the array.  Still check for slight width variance.. 
                            if(lastLineWidth !== w){
                                if(Math.abs(w - lastLineWidth) <= 5){ //within 5 pixels...

                                    //align them, call them the same Column. 
                                    /*
                                     * This is a consequence of #xywh for a resource needing to be an integer.  When I calculate its intger position off of
                                     * percentages, it is often a float and I have to round to write back.  This can cause a 1 or 2 pixel discrenpency, which I account
                                     * for here.  There may be better ways of handling this, but this is a good solution for now. 
                                     */
                                    w = lastLineWidth;
                                    numberArray[2] = w;
                                }
                            }
                        }
                        y = numberArray[1];
                        h = numberArray[3];
                        XYWHarray = [x,y,w,h];
                    }
                    else{
                        //ERROR! Malformed line
                        //update = false;
                        continue;
                    }
                }
                else{
                    //ERROR! Malformed line
                    //update = false;
                    continue;
                }
            }
            else{
                //ERROR!  Malformed line.  No coordinates. skip it. take it out of our cached lines.
                //lines.splice(i, 1);
                //update = false;
                continue;
            }
            
            if(goodLastLine){
                if(line.resource['cnt:chars'] !== undefined && line.resource['cnt:chars'] !== "" && line.resource['cnt:chars'] != "Enter a line transcription"){
                    thisContent = line.resource['cnt:chars'];
                }

                counter=parseInt(counter);
                counter += 1;
                
                var htmlSafeText = $("<div/>").text(thisContent).html();
                //var htmlSafeText2 = $("<div/>").text(thisNote).html();
                var newAnno = $('<div id="transcriptlet_' + counter + '" col="' + col
                    + '" colLineNum="' + colCounter + '" lineID="' + counter
                    + '" lineserverid="' + lineID + '" class="transcriptlet" data-answer="'
                    + escape(thisContent) + '"><textarea class="theText" placeholder="' + thisPlaceholder + '">'
                    + htmlSafeText + '</textarea></div>');           
                
                var left = parseFloat(XYWHarray[0]) / (10 * ratio);
                var top = parseFloat(XYWHarray[1]) / 10;
                var width = parseFloat(XYWHarray[2]) / (10 * ratio);
                var height = parseFloat(XYWHarray[3]) / 10;
                newAnno.attr({
                    lineLeft: left,
                    lineTop: top,
                    lineWidth: width,
                    lineHeight: height,
                    counter: counter
                });
                
                $("#transcriptletArea").append(newAnno);
                var lineColumnIndicator = $("<div onclick='loadTranscriptlet("+counter+");' pair='"+col+""+colCounter+"' lineserverid='"+lineID+"' lineID='"+counter+"' class='lineColIndicator' style='left:"+left+"%; top:"+top+"%; width:"+width+"%; height:"+height+"%;'><div class\n\
                ='lineColOnLine' >"+col+""+colCounter+"</div></div>");
                var fullPageLineColumnIndicator = $("<div pair='"+col+""+colCounter+"' lineserverid='"+lineID+"' lineID='"+counter+"' class='lineColIndicator fullP'\n\
                onclick=\"updatePresentation($('#transcriptlet_"+counter+"'));\" style='left:"+left+"%; top:"+top+"%; width:"+width+"%; height:"+height+"%;'><div class\n\
                ='lineColOnLine' >"+col+""+colCounter+"</div></div>"); //TODO add click event to update presentation
                //Make sure the col/line pair sits vertically in the middle of the outlined line.  
                var lineHeight = theHeight * (height/100) + "px";
                lineColumnIndicator.find('.lineColOnLine').attr("style", "line-height:"+lineHeight+";");
                //Put to the DOM
                colCounter+=1;
                $(".lineColIndicatorArea").append(lineColumnIndicator);
                $("#fullPageSplitCanvas").append(fullPageLineColumnIndicator);
            }
        }
        //BH it is very important that this fires.  Why isn't it?
        //Some lines dont have #xywh=1,2,3,4
        if(update && $(".transcriptlet").eq(0) !== undefined){
            updatePresentation($(".transcriptlet").eq(0));
        }
        //we want automatic updating for the lines these texareas correspond to.
        var typingTimer;                //timer identifier
        $("textarea").keydown(function(e){
            //user has begun typing, clear the wait for an update
            clearTimeout(typingTimer);
        });
        $("textarea").keyup(function(e){
            var lineToUpdate = $(this).parent();
            clearTimeout(typingTimer);
            //when a user stops typing for 2 seconds, fire an update to get the new text.
            typingTimer = setTimeout(function(){
                updateLine(lineToUpdate, "no");
            }, 2000);
        });
        textSize();
        //With this, every time the lines are redrawn for a canvas, they are repopulated to the preview text split.
        populatePreview(transcriptionFolios[currentFolio-1].otherContent[0].resources, transcriptionFolios[currentFolio-1].label, "currentPage", currentFolio-1);
        
        //With this, we call to the annotation store to gather the lines again then popluate the preview.  
        //gatherAndPopluate(transcriptionFolios[currentFolio-1]["@id"], transcriptionFolios[currentFolio-1]["@id"], "currentPage", currentFolio-1);
    }
    
    /* Make the transcription interface focus to the transcriptlet passed in as the parameter. */
function updatePresentation(transcriptlet) {
    if (transcriptlet === undefined || transcriptlet === null){
        $("#imgTop").css("height", "0%");
        $("#imgBottom").css("height", "inherit");
        return false;
    }
    var currentCol = transcriptlet.attr("col");
    var currentColLineNum = parseInt(transcriptlet.attr("collinenum"));
    var transcriptletBefore = $(transcriptlet.prev());
    var currentColLine = currentCol + "" + currentColLineNum;
    if(currentColLine.indexOf("NaN")>-1 || currentColLine.indexOf("undefined")>-1 ){
        currentColLine = "**";
    }
    $("#currentColLine").html(currentColLine);
    if (parseInt(currentColLineNum) >= 1){
        if (transcriptletBefore.hasClass("transcriptlet")){
            var prevColLineNum = parseInt(transcriptletBefore.attr("collinenum"));
            var prevLineCol = transcriptletBefore.attr("col");
            var prevLineText = unescape(transcriptletBefore.attr("data-answer"));
            //var prevLineNote = unescape(transcriptletBefore.find(".notes").attr("data-answer"));
            $("#prevColLine").html(prevLineCol + "" + prevColLineNum).css("visibility","");
            $("#captionsText").text((prevLineText.length && prevLineText) || "This line is not transcribed.").attr("title",prevLineText);
                
                    //.next().html(prevLineNote).attr("title",prevLineNote);
        }
        else { //there is no previous line
            $("#prevColLine").html(prevLineCol + "" + prevColLineNum).css("visibility","hidden");
            $("#captionsText").html("You are on the first line.").next().html("");
        }
    }
    else { //this is a problem
        $("#prevColLine").html(currentCol + "" + currentColLineNum-1).css("visibility","hidden");
        $("#captionsText").html("ERROR.  NUMBERS ARE OFF").next().html("");
    }
    focusItem[0] = focusItem[1];
    focusItem[1] = transcriptlet;
    if ((focusItem[0] === null)
        || (focusItem[0].attr("id") !== focusItem[1].attr("id"))) {
        adjustImgs(setPositions());
        swapTranscriptlet();
        // show previous line transcription
        $('#captions').css({
            opacity: 1
        });
    }
    else {
        adjustImgs(setPositions());
        focusItem[1].prevAll(".transcriptlet").addClass("transcriptletBefore").removeClass("transcriptletAfter");
        focusItem[1].nextAll(".transcriptlet").addClass("transcriptletAfter").removeClass("transcriptletBefore");
    }
    // prevent textareas from going invisible and not moving out of the workspace
    if(focusItem[1].find('.theText')[0]){
        focusItem[1].removeClass("transcriptletBefore transcriptletAfter")
            .find('.theText')[0].focus();
    }
    // change prev/next at page edges
//    if($(".transcriptletBefore").size()===0){
//        $("#prevLine").hide();
//        $("#prevPage").show();
//    } else {
//        $("#prevLine").show();
//        $("#prevPage").hide();
//    }
//    if($(".transcriptletAfter").size()===0){
//        $("#nextLine").hide();
//        $("#nextPage").show();
//    } else {
//        $("#nextLine").show();
//        $("#nextPage").hide();
//    }
    if(minimalLines){
        $.each($(".lineColOnLine"), function(){$(this).css("line-height", ($(this).height() * 2)-15 + "px"); });
    }
    else{
        $.each($(".lineColOnLine"), function(){
            $(this).css("line-height", $(this).height() + "px");
        });
    }

}
   
      
    function setPositions() {
        // Determine size of section above workspace
        var bottomImageHeight = $("#imgBottom img").height();
        if (focusItem[1].attr("lineHeight") !== null) {
            var pairForBookmarkCol = focusItem[1].attr('col');
            var pairForBookmarkLine = parseInt(focusItem[1].attr('collinenum'));
            var pairForBookmark = pairForBookmarkCol + pairForBookmarkLine;
            var currentLineHeight = parseFloat(focusItem[1].attr("lineHeight"));
            var currentLineTop = parseFloat(focusItem[1].attr("lineTop"));
            var previousLineTop = 0.0;
            var previousLineHeight = 0.0;
            var imgTopHeight = 0.0; //value for the height of imgTop
            if(focusItem[1].prev().is('.transcriptlet') && currentLineTop > parseFloat(focusItem[1].prev().attr("lineTop"))){
                previousLineTop = parseFloat(focusItem[1].prev().attr("lineTop"));
                previousLineHeight = parseFloat(focusItem[1].prev().attr("lineHeight"));
            }
            var bufferForImgTop = previousLineTop - 1.5;
            if(previousLineHeight > 0.0){
                imgTopHeight = (previousLineHeight + currentLineHeight) + 3.5;
            }
            else{ //there may not be a prev line so use the value of the current line...
                imgTopHeight = (currentLineHeight) + 3.5;
                bufferForImgTop = currentLineTop - 1.5;
            }
            //var topImgPositionPercent = ((previousLineTop - currentLineTop) * 100) / imgTopHeight;
            var imgTopSize = (((imgTopHeight/100)*bottomImageHeight) / Page.height())*100;
            if(bufferForImgTop < 0){
                bufferForImgTop = 0;
            }
            //We may not be able to show the last line + the next line if there were two tall lines, so account for that here
            if (imgTopSize > 80){
                bufferForImgTop = currentLineTop - 1.5; //No longer adjust to previous line, adjust to current line.
                if(bufferForImgTop < 0){
                    bufferForImgTop = 0;
                }
                imgTopHeight = (currentLineHeight) + 3.5; //There will be a new height because of it
                imgTopSize = (((imgTopHeight/100)*bottomImageHeight) / Page.height())*100; //There will be a new size because of it to check later.
            }
            var topImgPositionPx = ((-(bufferForImgTop) * bottomImageHeight) / 100);
            if(topImgPositionPx <= -12){
                topImgPositionPx += 12;
            }
            //var bottomImgPositionPercent = -(currentLineTop + currentLineHeight);
            var bottomImgPositionPx = -((currentLineTop + currentLineHeight) * bottomImageHeight / 100);
            if(bottomImgPositionPx <= -12){
                bottomImgPositionPx += 12;
            }

            var percentageFixed = 0;
            //use this to make sure workspace stays on screen!
            if (imgTopSize > 80){ //if #imgTop is 80% of the screen size then we need to fix that so the workspace stays.
                var workspaceHeight = 170; //$("#transWorkspace").height();
                var origHeight = imgTopHeight;
                imgTopHeight = ((Page.height() - workspaceHeight - 80) / bottomImageHeight) *  100; //this needs to be a percentage
                percentageFixed = (100-(origHeight - imgTopHeight))/100; //what percentage of the original amount is left
                //bottomImgPositionPercent *= percentageFixed; //do the same percentage change to this value
                bottomImgPositionPx *= percentageFixed; //and this one
                topImgPositionPx *= percentageFixed; // and this one

            }

        }
        var positions = {
            imgTopHeight: imgTopHeight,
            //topImgPositionPercent: topImgPositionPercent,
            topImgPositionPx : topImgPositionPx,
            //bottomImgPositionPercent: bottomImgPositionPercent,
            bottomImgPositionPx: bottomImgPositionPx,
            activeLine: pairForBookmark
        };
        imgTopPositionRatio = positions.topImgPositionPx / bottomImageHeight;
        imgBottomPositionRatio = positions.bottomImgPositionPx / bottomImageHeight;
        return positions;
    }
     
    /* Helper for position focus onto a specific transcriptlet */
//    function setPositions() {
//    //Determine size of section above workspace
//        var bottomImageHeight = $("#imgBottom img").height();
//        if (focusItem[1].attr("lineHeight") !== null) {
//          var pairForBookmarkCol = focusItem[1].attr('col');
//          var pairForBookmarkLine = parseInt(focusItem[1].attr('collinenum'));
//          pairForBookmarkLine += 1;
//          var pairForBookmark = pairForBookmarkCol + pairForBookmarkLine;
//          var currentLineHeight = parseFloat(focusItem[1].attr("lineHeight"));
//          var currentLineTop = parseFloat(focusItem[1].attr("lineTop"));
//          // top of column
//          var previousLine = (focusItem[1].prev().is('.transcriptlet') && (currentLineTop > parseFloat(focusItem[1].prev().attr("lineTop")))) ? parseFloat(focusItem[1].prev().attr("lineHeight")) : parseFloat(focusItem[1].attr("lineTop"));
//          // oversized for screen
//          var imgTopHeight = (previousLine + currentLineHeight)+1.5; // obscure behind workspace.
//          var topImgPositionPercent = ((previousLine - currentLineTop)*100)/imgTopHeight;
//          var topImgPositionPx = (previousLine - currentLineTop)*bottomImageHeight/100;
////          var bookmarkTop = (currentLineTop + ((imgTopHeight/100)*topImgPositionPercent));
//          var bottomImgPositionPercent = -(currentLineTop + currentLineHeight);
//          var bottomImgPositionPx = -(currentLineTop+currentLineHeight)*bottomImageHeight / 100;
//        }
//        var positions = {
//          imgTopHeight: imgTopHeight,
//          topImgPositionPercent: topImgPositionPercent,
//          topImgPositionPx : topImgPositionPx,
//          bottomImgPositionPercent: bottomImgPositionPercent,
//          bottomImgPositionPx: bottomImgPositionPx,
//          activeLine: pairForBookmark
////          bookmarkTop: (parseFloat(locationForBookmark.css("top")) / $(".lineColIndicatorArea:first").height()) * 100 + "%",
////          bookmarkHeight: currentLineHeight
//        };
//        return positions;
//    };
  
  /**
   * Removes previous textarea and slides in the new focus.
   *
   * @see updatePresentation()
   */
    function swapTranscriptlet() {
      //focusItem[0].addClass("transcriptletBefore").removeClass('noTransition');
      // slide in the new transcriptlet
      focusItem[1].css({"width": "auto", "z-index": "5"});
      focusItem[1].removeClass("transcriptletBefore transcriptletAfter");
      focusItem[1].prevAll(".transcriptlet").addClass("transcriptletBefore").removeClass("transcriptletAfter");
      focusItem[1].nextAll(".transcriptlet").addClass("transcriptletAfter").removeClass("transcriptletBefore");
      if($('.transcriptletAfter').length == 0){
          $('#nextTranscriptlet').hide();
      }
      else{
          $('#nextTranscriptlet').show();
      }
      if($('.transcriptletBefore').length == 0){
          $('#previousTranscriptlet').hide();
      }
      else{
           $('#previousTranscriptlet').show();
      }
    };
    
  /**
   * Aligns images and workspace using defined dimensions.
   *
   * @see maintainWorkspace()
   */
    function adjustImgs(positions) {
      //move background images above and below the workspace
        var lineToMakeActive = $(".lineColIndicator[pair='"+positions.activeLine+"']"); //:first
        var topImageHeight = $("#imgTop img").height();
        $("#imgTop").animate({
          "height": positions.imgTopHeight + "%"
        },250)
        .find("img").animate({
          top: positions.topImgPositionPx + "px",
          left: "0px"
        },250);
       $("#imgTop .lineColIndicatorArea").animate({
          top: positions.topImgPositionPx + "px",
          left: "0px"
        },250);
        $("#imgBottom").find("img").animate({
          top: positions.bottomImgPositionPx  + "px",
          left: "0px"
        },250)
        $("#imgBottom .lineColIndicatorArea").animate({
          top: positions.bottomImgPositionPx  + "px",
          left: "0px"
        },250);
        if($('.activeLine').hasClass('linesHidden')){
            $('.activeLine').hide();
        }
        var activeColor = colorThisTime.replace(".4", "1");
        $(".lineColIndicator")
           .removeClass('activeLine')
           .css({
               "background-color":"transparent",
               "opacity" : ".36",
               "box-shadow": "none",
               "border" : "2px solid "+activeColor
        });
          lineToMakeActive.addClass("activeLine");
          //use the active line color to give the active line a little background color to make it stand out if the box shadow is not enough.
            if(!minimalLines){
                lineToMakeActive.css({
                    "box-shadow" : "0px 0px 15px 8px "+activeColor,
                    "border" : "2px solid "+activeColor,
                    "opacity" : ".6"
                });
            }
            else{
                lineToMakeActive.css({
                    "box-shadow" : "0px 9px 5px -5px "+colorThisTime,
                    "opacity" : ".6"
                });
            }
    }  
   
   /* Update the line information of the line currently focused on, then load the focus to a line that was clicked on */
   function loadTranscriptlet(lineid){
        var currentLineServerID = focusItem[1].attr("lineserverid");
        if($('#transcriptlet_'+lineid).length > 0){
            if(loggedInUser){
                var lineToUpdate = $(".transcriptlet[lineserverid='"+currentLineServerID+"']");
                updateLine(lineToUpdate, "no");
                updatePresentation($('#transcriptlet_'+lineid));
            }
            else{
              var captionText1 = $("#captionsText").html();
              $("#captionsText").html("You are not logged in.");
              $('#captionsText').css("background-color", 'red');
              setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8'); }, 500);
              setTimeout(function(){ $('#captionsText').css("background-color", 'red'); }, 1000);
              setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8');  $("#captionsText").html(captionText1); }, 1500);
            }

        }
        else{ //blink a caption warning
            var captionText = $("#captionsText").html();
            $("#captionsText").html("Cannot load this line.");
            $('#captionsText').css("background-color", 'red');
            setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8'); }, 500);
            setTimeout(function(){ $('#captionsText').css("background-color", 'red'); }, 1000);
            setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8');  $("#captionsText").html(captionText); }, 1500);
        }
   }
  
    /*
     * The UI control for going the the next transcriptlet in the transcription. 
     */
    function nextTranscriptlet() {
          var nextID = parseInt(focusItem[1].attr('lineID')) + 1;
          var currentLineServerID = focusItem[1].attr("lineserverid");
          if($('#transcriptlet_'+nextID).length > 0){
              if(loggedInUser){
                  var lineToUpdate = $(".transcriptlet[lineserverid='"+currentLineServerID+"']")
                  updateLine(lineToUpdate, "no");
                  updatePresentation($('#transcriptlet_'+nextID));
              }
              else{
                var captionText1 = $("#captionsText").html();
                $("#captionsText").html("You are not logged in.");
                $('#captionsText').css("background-color", 'red');
                setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8'); }, 500);
                setTimeout(function(){ $('#captionsText').css("background-color", 'red'); }, 1000);
                setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8');  $("#captionsText").html(captionText1); }, 1500);
              }
              
          }
          else{ //blink a caption warning
              var captionText = $("#captionsText").html();
              $("#captionsText").html("You are on the last line! ");
              $('#captionsText').css("background-color", 'red');
              setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8'); }, 500);
              setTimeout(function(){ $('#captionsText').css("background-color", 'red'); }, 1000);
              setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8');  $("#captionsText").html(captionText); }, 1500);
          }
    }
    
    /*
     * The UI control for going the the previous transcriptlet in the transcription. 
     */
    function previousTranscriptlet() {
          var prevID = parseFloat(focusItem[1].attr('lineID')) - 1;
          var currentLineServerID = focusItem[1].attr("lineServerID");
          //var currentLineText = focusItem[1].find('textarea').val();
          if(prevID >= 0){
              if(loggedInUser){
                var lineToUpdate = $(".transcriptlet[lineserverid='"+currentLineServerID+"']");
                updateLine(lineToUpdate, "no");
                updatePresentation($('#transcriptlet_'+prevID));
              }
              else{
                var captionText1 = $("#captionsText").html();
                $("#captionsText").html("You are not logged in.");
                $('#captionsText').css("background-color", 'red');
                setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8'); }, 500);
                setTimeout(function(){ $('#captionsText').css("background-color", 'red'); }, 1000);
                setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8');  $("#captionsText").html(captionText1); }, 1500);
              }
              
          }
          else{
              //captions already say "You are on the first line"
              $('#captionsText').css("background-color", 'red');
              setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8'); }, 500);
              setTimeout(function(){ $('#captionsText').css("background-color", 'red'); }, 1000);
              setTimeout(function(){ $('#captionsText').css("background-color", '#E6E7E8');  $("#captionsText").html(captionText); }, 1500);
          }
    }

    
    function scrub(thisText){
        var workingText = $("<div/>").text(thisText).html();
        var encodedText = [workingText];
        if (workingText.indexOf("&gt;")>-1){
            var open = workingText.indexOf("&lt;");
            var beginTags = new Array();
            var endTags = new Array();
            var i = 0;
            while (open > -1){
                beginTags[i] = open;
                var close = workingText.indexOf("&gt;",beginTags[i]);
                if (close > -1){
                    endTags[i] = (close+4);
                } else {
                    beginTags[0] = null;
                    break;}
                open = workingText.indexOf("&lt;",endTags[i]);
                i++;
            }
            //use endTags because it might be 1 shorter than beginTags
            var oeLen = endTags.length; 
            encodedText = [workingText.substring(0, beginTags[0])];
            for (i=0;i<oeLen;i++){
                encodedText.push("<span class='previewTag'>",
                    workingText.substring(beginTags[i], endTags[i]),
                    "</span>");
                if (i!=oeLen-1){
                    encodedText.push(workingText.substring(endTags[i], beginTags[i+1]));
            }
            }
        if(oeLen>0)encodedText.push(workingText.substring(endTags[oeLen-1]));
        }
        return encodedText.join("");
    }
  
    
    /** 
     * 
     * Allows workspace to be moved up and down on the screen.
     * Requires shift key to be held down.
     */
     function moveWorkspace(evt){
        $("#imgTop img,#imgBottom img,#imgTop .lineColIndicatorArea, #imgBottom .lineColIndicatorArea, #bookmark, #imgTop, #imgBottom").addClass('noTransition');
        var startImgTop = $("#imgTop").height();
        var startImgBottom = $("#imgBottom img").position().top;
        var startImgBottomH = $("#imgBottom").height();
        var mousedownPosition = evt.pageY;
        evt.preventDefault();
        $(dragHelper).appendTo("body");
        $(document)
        .disableSelection()
        .mousemove(function(event){

            var imgBtmSpot = startImgBottom - (event.pageY - mousedownPosition);
            $("#imgTop").height(startImgTop + event.pageY - mousedownPosition);
            $("#imgBottom").css({
                "height": startImgBottomH - (event.pageY - mousedownPosition)
            }).find("img").css({
                "top"   : startImgBottom - (event.pageY - mousedownPosition)
            });
            $("#imgBottom .lineColIndicatorArea").css("top", startImgBottom - (event.pageY - mousedownPosition)+"px");
            $("#dragHelper").css({
                top :   event.pageY - 90,
                left:   event.pageX - 90
            });
//            if(!event.altKey) unShiftInterface();
        })
        .mouseup(function(){
            $("#dragHelper").remove();
            $("#imgTop img,#imgBottom img,#imgTop .lineColIndicatorArea, #imgBottom .lineColIndicatorArea, #bookmark, #imgTop, #imgBottom").removeClass('noTransition');
            $(document)
            .enableSelection()
            .unbind("mousemove");
            isUnadjusted = false;
        });
    };
    
    function fullTopImage(){
        $("#imgTop").css("height","100vh");
        $(".hideMe").hide();
        $(".showMe2").show();
    }
    
    /* Start event listening to move the image in the transcirption interface */
     function startMoveImg(){
        $("#moveImage").addClass("selected");
        $(".transcriptlet").addClass("moveImage");
        $(".transcriptlet").children("textarea").attr("disabled", "");
        $("#imgTop, #imgBottom").css("cursor", "url("+"images/open_grab.png),auto");
        $("#imgTop,#imgBottom").mousedown(function(event){$("#imgTop, #imgBottom").css("cursor", "url("+"images/close_grab.png),auto");  moveImg(event);});
        //The event is unregistered in the keyup on newberryTrans.html
    }
    
    /** 
     * Allows manuscript image to be moved around.
     * Requires shift key to be held down.
     * Synchronizes movement of top and bottom images.
     * Bookmark bounding box moves with top image.
     */
     function moveImg(event){
        var startImgPositionX = parseFloat($("#imgTop img").css("left"));
        var startImgPositionY = parseInt($("#imgTop img").css("top"));
        var startBottomImgPositionX = parseInt($("#imgBottom img").css("left"));
        var startBottomImgPositionY = parseInt($("#imgBottom img").css("top"));
        var mousedownPositionX = event.pageX;
        var mousedownPositionY = event.pageY;
        event.preventDefault();
        $("#imgTop").trigger('mousemove');
        $("#imgBottom").trigger('mousemove');
        $(document)
        .disableSelection()
        .mousemove(function(event){
            $("#imgTop img").css({
                top :   startImgPositionY + event.pageY - mousedownPositionY,
                left:   startImgPositionX + event.pageX - mousedownPositionX
            });
            $("#imgTop .lineColIndicatorArea").css({
                top :   startImgPositionY + event.pageY - mousedownPositionY,
                left:   startImgPositionX + event.pageX - mousedownPositionX
            });
            $("#imgBottom img").css({
                top :   startBottomImgPositionY + event.pageY - mousedownPositionY,
                left:   startBottomImgPositionX + event.pageX - mousedownPositionX
            });
             $("#imgBottom .lineColIndicatorArea").css({
                top :   startBottomImgPositionY + event.pageY - mousedownPositionY,
                left:   startBottomImgPositionX + event.pageX - mousedownPositionX
            });
//            if(!event.altKey) unShiftInterface();
        })
        .mouseup(function(){
            $("#dragHelper").remove();
            $(document)
            .enableSelection()
            .unbind("mousemove");
            isUnadjusted = false;
            $("#imgTop, #imgBottom").css("cursor", "url("+"images/open_grab.png),auto");
            $("#imgTop").trigger('mousemove');
            $("#imgBottom").trigger('mousemove');
        });
        //These events are unregistered in keyup() on newberryTrans.html
    };
    
    function restoreWorkspace(){
        $("#imgBottom").show();
        $("#imgTop").show();
        $("#imgTop").removeClass("fixingParsing");
        $("#transWorkspace").show();
        $("#imgTop").css("width", "100%");
        $("#imgTop img").css({"height":"auto", "width":"100%"});
        $("#imgBottom").css("height", "inherit");
        if(focusItem[0] == null && focusItem[1] == null){
            updatePresentation($("#transcriptlet_0"));
        }
        else{
            updatePresentation(focusItem[1]);
        }
        
        $(".hideMe").show();
        $(".showMe2").hide();
    //    var pageJumpIcons = $("#pageJump").parent().find("i");
    //    pageJumpIcons[0].setAttribute('onclick', 'firstFolio();');
    //    pageJumpIcons[1].setAttribute('onclick', 'previousFolio();');
    //    pageJumpIcons[2].setAttribute('onclick', 'nextFolio();');
    //    pageJumpIcons[3].setAttribute('onclick', 'lastFolio();');
        $("#prevCanvas").attr("onclick", "previousFolio();");
        $("#nextCanvas").attr("onclick", "nextFolio();");
        $("#pageJump").removeAttr("disabled");
    }
    
    function hideWorkspaceToSeeImage(){
        $("#transWorkspace").hide();
        $("#imgTop").hide();
        $("#imgBottom img").css({
            "top" :"0%",
            "left":"0%"
        });
        $("#imgBottom .lineColIndicatorArea").css({
            "top": "0%"
        });
        $(".hideMe").hide();
        $(".showMe").show();
    }
    
    function magnify(img, event){
//For separating out different imgs on which to zoom.  Right now it is just the transcription canvas.
        if(img === "trans"){
            img = $("#transcriptionTemplate");
            $("#magnifyTools").fadeIn(800);
            $("button[magnifyimg='trans']").addClass("selected");
        }
        else if(img === "compare"){
            img= $("#compareSplit");
            $("#magnifyTools").fadeIn(800).css({
                "left":$("#compareSplit").css("left"),
                "top" : "100px"
            });
            $("button[magnifyimg='compare']").addClass("selected");
        }
        else if (img === "full"){
            img = $("#fullPageSplitCanvas");
             $("#magnifyTools").fadeIn(800).css({
                "left":$("#fullPageSplit").css("left"),
                "top" : "100px"
            });
            $("button[magnifyimg='full']").addClass("selected");
        }
        $("#zoomDiv").show();
        $(".magnifyHelp").show();
        hideWorkspaceToSeeImage();
        $(".lineColIndicatorArea").hide();
        liveTool = "image";
        mouseZoom(img,event);
//        });
    };
    /** 
     * Creates a zoom on the image beneath the mouse.
     *  
     * @param img jQuery img element to zoom on
     */
    function mouseZoom($img, event){
        isMagnifying = true;
        var imgURL = $img.find("img:first").attr("src");
        var page = $("#transcriptionTemplate");
        //var page = $(document);
        //collect information about the img
        var imgDims = new Array($img.offset().left,$img.offset().top,$img.width(),$img.height());
        //build the zoomed div
        var zoomSize = (page.height()/3 < 120) ? 120 : page.height()/3;
        if(zoomSize > 400) zoomSize = 400;
        var zoomPos = new Array(event.pageX, event.pageY );
        $("#zoomDiv").css({
            "box-shadow"    : "2px 2px 5px black,15px 15px "+zoomSize/3+"px rgba(230,255,255,.8) inset,-15px -15px "+zoomSize/3+"px rgba(0,0,15,.4) inset",
            "width"         : zoomSize,
            "height"        : zoomSize,
            "left"          : zoomPos[0] + 3,
            "top"           : zoomPos[1] + 3 - $(document).scrollTop() - $(".magnifyBtn").offset().top,
            "background-position" : "0px 0px",
            "background-size"     : imgDims[2] * zoomMultiplier+"px",
            "background-image"    : "url('"+imgURL+"')"
        });
        $(document).on({
                mousemove: function(event){
                  if (liveTool !== "image" && liveTool !== "compare") {
                    $(document).off("mousemove");
                    $("#zoomDiv").hide();
                  }
                var mouseAt = new Array(event.pageX,event.pageY);
                var zoomPos = new Array(mouseAt[0]-zoomSize/2,mouseAt[1]-zoomSize/2);
                var imgPos = new Array((imgDims[0]-mouseAt[0])*zoomMultiplier+zoomSize/2-3,(imgDims[1]-mouseAt[1])*zoomMultiplier+zoomSize/2-3); //3px border adjustment
                $("#zoomDiv").css({
                    "left"  : zoomPos[0],
                    "top"   : zoomPos[1] - $(document).scrollTop(),
                    "background-size"     : imgDims[2] * zoomMultiplier+"px",
                    "background-position" : imgPos[0]+"px " + imgPos[1]+"px"
                });
            }
          }, $img
        );
    };
    
    function removeTransition(){
        $("#imgTop img").css("-webkit-transition", "");
        $("#imgTop img").css("-moz-transition", "");
        $("#imgTop img").css("-o-transition", "");
        $("#imgTop img").css("transition", "");

        $("#imgBottom img").css("-webkit-transition", "");
        $("#imgBottom img").css("-moz-transition", "");
        $("#imgBottom img").css("-o-transition", "");
        $("#imgBottom img").css("transition", "");

        $("#imgTop").css("-webkit-transition", "");
        $("#imgTop").css("-moz-transition", "");
        $("#imgTop").css("-o-transition", "");
        $("#imgTop").css("transition", "");

        $("#imgBottom").css("-webkit-transition", "");
        $("#imgBottom").css("-moz-transition", "");
        $("#imgBottom").css("-o-transition", "");
        $("#imgBottom").css("transition", "");
    };
    
    function restoreTransition(){
        $("#imgTop img").css("-webkit-transition", "left .5s, top .5s, width .5s");
        $("#imgTop img").css("-moz-transition", "left .5s, top .5s, width .5s");
        $("#imgTop img").css("-o-transition", "left .5s, top .5s, width .5s");
        $("#imgTop img").css("transition", "left .5s, top .5s, width .5s");

        $("#imgBottom img").css("-webkit-transition", "left .5s, top .5s, width .5s");
        $("#imgBottom img").css("-moz-transition", "left .5s, top .5s, width .5s");
        $("#imgBottom img").css("-o-transition", "left .5s, top .5s, width .5s");
        $("#imgBottom img").css("transition", "left .5s, top .5s, width .5s");

        $("#imgTop").css("-webkit-transition", "left .5s, top .5s, width .5s");
        $("#imgTop").css("-moz-transition", "left .5s, top .5s, width .5s");
        $("#imgTop").css("-o-transition", "left .5s, top .5s, width .5s");
        $("#imgTop").css("transition", "left .5s, top .5s, width .5s");

        $("#imgBottom").css("-webkit-transition", "left .5s, top .5s, width .5s");
        $("#imgBottom").css("-moz-transition", "left .5s, top .5s, width .5s");
        $("#imgBottom").css("-o-transition", "left .5s, top .5s, width .5s");
        $("#imgBottom").css("transition", "left .5s, top .5s, width .5s");
    };
    
    function toggleImgTools(event){
    var locationX = event.pageX;
    var locationY = event.pageY;
    $("#imageTools").css({
        "display":  "block",
        "left" : locationX + "px",
        "top" : locationY + 15 + "px"
    });
    $("#imageTools").draggable();
}

function toggleLineControls(event){
    var locationX = event.pageX;
    var locationY = event.pageY;
    $("#lineColControls").css({
        "display":  "block",
        "left" : locationX + "px",
        "top" : locationY + 15 + "px"
    });
    $("#lineColControls").draggable();
}

function toggleXMLTags(event){
    if($("#xmlTagFloat").is(":visible")){
        $("#xmlTagFloat").fadeOut();
    } else {
        $("#xmlTagFloat").css("display","flex").fadeIn();
    }
    $("#toggleXML").toggleClass('xml-tagged');
}

function toggleSpecialChars(event){
    if($("#specialCharsFloat").is(":visible")){
        $("#specialCharsFloat").fadeOut();
    } else {
        $("#specialCharsFloat").css("display","flex").fadeIn();
    }
    $("#toggleChars").toggleClass('special-charactered');
}
    
        /** 
     * Sets screen for parsing tool use.
     * Slides the workspace down and scales the top img
     * to full height. From here, we need to load to interface
     * for the selected tool. 
     */
    
    function hideWorkspaceForParsing(){
        if(liveTool === "parsing"){
            return false;
        }
        liveTool = "parsing";
        $("#parsingBtn").css("box-shadow: none;");
        imgTopOriginalTop = $("#imgTop img").css("top");
        if ($("#transcriptionTemplate").hasClass("ui-resizable")){
            $("#transcriptionTemplate").resizable('destroy');
        }
        $("#transcriptionTemplate").css("max-width", "55%").css("width", "55%");
        $("#controlsSplit").hide();
        var ratio = originalCanvasWidth / originalCanvasHeight;
        var newCanvasWidth = originalCanvasWidth * .55;
        var newCanvasHeight = 1 / ratio * newCanvasWidth;

        if($(window).height() <= 625){ //This is the smallest height we allow
            newCanvasHeight = 625;
        }
        else if ($(window).height() <= originalCanvasHeight){ //allow it to be as tall as possible, but not taller.
            newCanvasHeight = $(window).height();
            newCanvasWidth = ratio*newCanvasHeight;
        }
        else if($(window).height() > originalCanvasHeight){ //I suppose this is possible for small images, so handle if its trying to be bigger than possible
            newCanvasHeight = originalCanvasHeight;
            newCanvasWidth = originalCanvasWidth;
        }

        if($(window).width() > 900){ //Whenever it gets less wide than this, it prioritizes height and stops resizing by width.
            if($(window).width() < newCanvasWidth + $("#parsingSplit").width()){
                newCanvasWidth = $(window).width() - $("#parsingSplit").width();
                newCanvasHeight = 1/ratio*newCanvasWidth;
            }
        }
        else{ //Just do nothing instead of calling it 900 wide so it defaults to the height math, maybe put a max up there too.
    //                     newCanvasWidth = 900;
    //                     newCanvasHeight = 1/ratio*newCanvasWidth;
        }
        if(screen.width == $(window).width() && screen.height == window.outerHeight){
            $(".centerInterface").css("text-align", "center"); //.css("background-color", "#e1f4fe")
        }
        else{
            $(".centerInterface").css("text-align", "left"); //.css("background-color", "#e1f4fe")
        }
        if(newCanvasHeight > window.innerHeight -40){ //never let the bottom of the image go off screen.
            newCanvasHeight = window.innerHeight - 40;
            newCanvasWidth = ratio * newCanvasHeight;
        }
        $("#transcriptionTemplate").css("width","auto");
        $("#transcriptionCanvas").css("height", newCanvasHeight + "px");
        $("#transcriptionCanvas").css("width", newCanvasWidth + "px");
        $("#imgTop").css("height", newCanvasHeight + "px");
        $("#imgTop").css("width", newCanvasWidth + "px");
        $("#imgTop img").css({
            'height': newCanvasHeight + "px"
        });
        $("#splitScreenTools").attr("disabled", "disabled");
        $("#prevCanvas").attr("onclick", "");
        $("#nextCanvas").attr("onclick", "");
        $("#imgTop").addClass("fixingParsing");
        var topImg = $("#imgTop img");

        $("#tools").children("[id$='Split']").hide();
        $("#parsingSplit")
        .css({
            "display": "inline-block",
            //"height": window.innerHeight + "px"
        })
        .fadeIn();

        topImg.css({
            "top":"0px",
            "left":"0px",
            "overflow":"auto"
        });
        $("#imgTop .lineColIndicatorArea").css({
            "top":"0px",
            "left":"0px",
            "height":newCanvasHeight+"px"
        });
        
        $("#transWorkspace,#imgBottom").hide();
        $("#noLineWarning").hide();
        window.setTimeout(function(){
            $("#imgTop img").css("width", "auto");
            $("#imgTop img").css("top", "0px");
            $("#transcriptionTemplate").css("width", "auto"); //fits canvas to image. $("#imgTop img").width() + "px".  Do we need a background color?
            $("#transcriptionCanvas").css("display", "block");
        }, 500);
        window.setTimeout(function(){
            //in here we can control what interface loads up.  writeLines
            //draws lines onto the new full size transcription image.
            $('.lineColIndicatorArea').hide();
            writeLines($("#imgTop img"));
        }, 1200);
    }
    
    /** 
     * Overlays divs for each parsed line onto img indicated.
     * Divs receive different classes in different 
     *  
     * @param imgToParse img element lines will be represented over
     */
    function writeLines(imgToParse){
        $(".line,.parsing,.adjustable,.parsingColumn").remove(); //clear and old lines to put in updated ones
        var originalX = (imgToParse.width()/imgToParse.height())*1000;
        var setOfLines = [];
        var count = 0;
        $(".transcriptlet").each(function(index){
            count++;
            setOfLines[index] = makeOverlayDiv($(this),originalX, count);
        });
        imgToParse.parent().append($(setOfLines.join("")));
    }
    
    function makeOverlayDiv(thisLine, originalX, cnt){
        var Y = parseFloat(thisLine.attr("lineTop"));
        var X = parseFloat(thisLine.attr("lineLeft"));
        var H = parseFloat(thisLine.attr("lineHeight"));
        var W = parseFloat(thisLine.attr("lineWidth"));
        var newY = (Y);
        var newX = (X);
        var newH = (H);
        var newW = (W);
        var hasTrans = false;
        if(thisLine.attr("data-answer") !== undefined && thisLine.attr("data-answer")!==""){
            hasTrans = true;
        }
        var lineOverlay = "<div class='parsing' lineid='" + (parseInt(cnt)-1) + "' style='top:"
            + newY + "%;left:" + newX + "%;height:"
            + newH + "%;width:" + newW + "%;' lineserverid='"
            + thisLine.attr('lineserverid') + "'linetop='"
            + Y + "'lineleft='" + X + "'lineheight='"
            + H + "'linewidth='" + W + "' hastranscription='"+hasTrans+"'></div>";
        return lineOverlay;
    }


    /* Reset the interface to the full screen transcription view. */
    function fullPage(){
        if ($("#overlay").is(":visible")) {
            $("#overlay").click();
            return false;
        }
        liveTool = "none";
        $(".line, .parsing, .adjustable,.parsingColumn").remove();
        isUnadjusted = isFullscreen = true;
        //currentFocus = "transcription" + focusItem[1].attr('id').substring(1);
        if($("#trascriptionTemplate").hasClass("ui-resizable")){
            $("#transcriptionTemplate").resizable('destroy');
        }
       $("#splitScreenTools").find('option:eq(0)').prop("selected", true);
        $("#transcriptionCanvas").css("width", "100%");
        $("#transcriptionCanvas").css("height", "auto");
        $("#transcriptionCanvas").css("max-height", "none");
        $("#transcriptionTemplate").css("width", "100%");
        $("#transcriptionTemplate").css("max-width", "100%");
        $("#transcriptionTemplate").css("max-height", "none");
        $("#transcriptionTemplate").css("height", "auto");
        $("#transcriptionTemplate").css("display", "inline-block");
        $("#canvasControls").removeClass("selected");
        $('.lineColIndicatorArea').css("max-height","none");
        $('.lineColIndicatorArea').show();
        $(".centerInterface").css("text-align", "left");
        $("#canvasControls").removeClass("selected");
        $("#help").css({"left":"100%"}).fadeOut(1000);
        $("#fullScreenBtn").fadeOut(250);
        $("#parseOptions .tpenButton.selected").removeClass("selected");
        $(document).unbind("mousemove");
        $(document).unbind("mousedown");
        $(document).unbind("mouseup");

        isZoomed = false;
        $(".split").hide();
        $(".split").css("width", "43%");
//        //console.log("RESTORE WORKSPACE");
        $("#splitScreenTools").removeAttr("disabled")
        restoreWorkspace();
        $("#splitScreenTools").show();
        var screenWidth = $(window).width();
        var adjustedHeightForFullscreen = (originalCanvasHeight2 / originalCanvasWidth2) * screenWidth;
        $("#transcriptionCanvas").css("height", adjustedHeightForFullscreen+"px");
        $(".lineColIndicatorArea").css("height", adjustedHeightForFullscreen+"px");
        if(minimalLines){
            $.each($(".lineColOnLine"), function(){
                $(this).css("line-height", ($(this).height() * 2)-15 + "px"); 
            });
        }
        else{
            $.each($(".lineColOnLine"), function(){
                $(this).css("line-height", $(this).height() + "px");
            });
        }
        setTimeout(function(){
              document.body.scrollTop = document.documentElement.scrollTop = 0;
          },1);
    }
    
function splitPage(event, tool) {
    var resize = true;
    var newCanvasWidth = window.innerWidth * .55;
    var ratio = originalCanvasWidth / originalCanvasHeight;
    var fullPageMaxHeight = window.innerHeight - 125; //100 comes from buttons above image and topTrim
    var iframeDirectLink = "";
    $("#transcriptionTemplate").css({
        "width"   :   "55%",
        "display" : "inline-table"
    });
    $("#templateResizeBar").show();
    var splitWidthAdjustment = window.innerWidth - ($("#transcriptionTemplate").width() + 35) + "px";
    
    $("#fullScreenBtn")
        .fadeIn(250);
        $('.split').hide();
    
    var splitScreen = $("#" + tool + "Split");
    if(!splitScreen.size()){
        //Not sure what this is for...
    }
    splitScreen.css("display", "block");
    if(tool==="controls"){
        if(liveTool === "controls"){
            $("#canvasControls").removeClass("selected");
            return fullPage();
        }
        $("#canvasControls").addClass("selected");
        $("#transcriptionCanvas").css("width", Page.width()-200 + "px");
        $("#transcriptionTemplate").css("width", Page.width()-200 + "px");
        $("#canvasControls").addClass("selected");
        newCanvasWidth = Page.width()-200;
        $("#controlsSplit").show();
        resize = false; //interupts parsing resizing funcitonaliy, dont need to resize for this anyway.
    }
    else if(tool==="help"){
        if(liveTool === "help"){
            return fullPage();
        }
        $("#transcriptionCanvas").css("width", Page.width()-520 + "px");
        $("#transcriptionTemplate").css("width", Page.width()-520 + "px");
        newCanvasWidth = Page.width()-520;
        $("#helpSplit").show().height(Page.height()-$("#helpSplit").offset().top).scrollTop(0); // header space
        $("#helpContainer").height(Page.height()-$("#helpContainer").offset().top);
        resize = false; //interupts parsing resizing funcitonaliy, dont need to resize for this anyway.
    }
    else if(tool === "parsing"){
        resize=false;
    }
    else if(tool === "preview"){
        $("#previewSplit").show().height(Page.height()-$("#previewSplit").offset().top).scrollTop(0); // header space
        $("#previewDiv").height(Page.height()-$("#previewDiv").offset().top);
        $(".split img").css("max-width", splitWidthAdjustment);
        $(".split:visible").css("width", splitWidthAdjustment);
    }
    else if(tool === "fullPage"){ //set this to be the max height initially when the split happens.
        $("#fullPageImg").css("max-height", fullPageMaxHeight); //If we want to keep the full image on page, it cant be taller than that.
        $("#fullPageImg").css("max-width", splitWidthAdjustment);
        $("#fullPageSplitCanvas").css("max-height", fullPageMaxHeight); //If we want to keep the full image on page, it cant be taller than that.
        $("#fullPageSplitCanvas").css("max-width", splitWidthAdjustment); //If we want to keep the full image on page, it cant be taller than that.
        $("#fullPageSplitCanvas").height($("#fullPageImg").height());
        $("#fullPageSplitCanvas").width($("#fullPageImg").width());
        $(".fullP").each(function(i){
            this.title = $("#transcriptlet_"+i+" .theText").text();
        })
            .tooltip();
    }
    else if(tool === "compare"){
        $("#compareSplit img").css("max-height", fullPageMaxHeight); //If we want to keep the full image on page, it cant be taller than that.
        $("#compareSplit img").css("max-width", splitWidthAdjustment); //If we want to keep the full image on page, it cant be taller than that.
        $("#compareSplit").css("width", splitWidthAdjustment);
    }
    else if(tool === "partialTrans"){
        //default is https://paleography.library.utoronto.ca/content/partial_transcriptions?response_type=embed
        var currentCanvasLabel = transcriptionFolios[currentFolio - 1]["label"];
        var utlID = "";    
        if(currentCanvasLabel.split("_").length - 1 === 2){ //Must be in format like FP_000_000
            //We need to get the UTL canvas id for this particular canvas to support direct linking to the transcription for this object
            utlID = currentCanvasLabel.substring(0,currentCanvasLabel.lastIndexOf("_")).toLowerCase();
            iframeDirectLink = "https://paleography.library.utoronto.ca/content/transcript_"+utlID;
            console.log("Iframe direct link is" +iframeDirectLink);
            $("#partialTransSplit").children("iframe").attr("data_src", iframeDirectLink);
        }
        else{
            //This is not a UTL canvas or a canvas with a different label format.  Default to list of partial trans
            //The default is already populated in the html, so do nothing and the default will fire.
        }
        splitScreen.find("iframe").attr("src", splitScreen.find("iframe").attr("data_src"));
    }
    else if(tool === "essay"){
        //deault is https://paleography.library.utoronto.ca/content/background-essays?response_type=embed
        var currentCanvasLabel = transcriptionFolios[currentFolio - 1]["label"];
        var utlID = "";
        if(currentCanvasLabel.split("_").length - 1 === 2){ //Must be in format like FP_000_000
            //We need to get the UTL canvasID for this particular canvas to support direct linking to the essay for this object
            utlID = currentCanvasLabel.substring(0, currentCanvasLabel.lastIndexOf("_")).toLowerCase();
            iframeDirectLink = "https://paleography.library.utoronto.ca/content/about_"+utlID;
            console.log("Iframe direct link is" +iframeDirectLink);
            $("#essaySplit").children("iframe").attr("data_src", iframeDirectLink);
        }
        else{
            //This is not a UTL canvas or a canvas with a different @id format.  Default to list of essays
            //The default is already populated in the html, so do nothing and the default will fire.
        }
        splitScreen.find("iframe").attr("src", splitScreen.find("iframe").attr("data_src"));
    }
    else{
        splitScreen.find("iframe").attr("src", splitScreen.find("iframe").attr("data_src"));
    }
    liveTool = tool;
    var newCanvasHeight = 1 / ratio * newCanvasWidth;
    var newImgBtmTop = imgBottomPositionRatio * newCanvasHeight;
    var newImgTopTop = imgTopPositionRatio * newCanvasHeight;
    $("#transcriptionCanvas").css({
        "width"   :   newCanvasWidth + "px",
        "height"   :   newCanvasHeight + "px"
    });
    $(".lineColIndicatorArea").css("height", newCanvasHeight + "px");
    $("#imgBottom img").css("top", newImgBtmTop + "px");
    $("#imgBottom .lineColIndicatorArea").css("top", newImgBtmTop + "px");
    $("#imgTop img").css("top", newImgTopTop + "px");
    $("#imgTop .lineColIndicatorArea").css("top", newImgTopTop + "px");
    
    if(resize){
        attachTemplateResize();
    } else {
        detachTemplateResize();
        $("#templateResizeBar").hide();
    }
    setTimeout(function(){
        if(minimalLines){
            $.each($(".lineColOnLine"), function(){$(this).css("line-height", ($(this).height() * 2)-15 + "px"); });
        }
        else{
            $.each($(".lineColOnLine"), function(){
                $(this).css("line-height", $(this).height() + "px");
            });
        }
    }, 1000);
    
}
    
    function forceOrderPreview(){
        var ordered = [];
        var length = $(".previewPage").length;
        for(var i=0; i<length; i++){
            //console.log("find order = "+i)
            var thisOne = $(".previewPage[order='"+i+"']");
            ordered.push(thisOne);
            if(i===length - 1){
                //console.log("append");
                $("#previewDiv").empty();
                $("#previewDiv").append(ordered);
            }
        }
        $("#previewSplit").css({
              "display": "inline-table"
//              "height" : splitHeight+"px",
//              "width" : splitWidth
            });
    }

    function populateCompareSplit(folioIndex){
        var canvasIndex = folioIndex - 1;
        var compareSrc = transcriptionFolios[canvasIndex].images[0].resource["@id"];
        var currentCompareSrc = $(".compareImage").attr("src");
        if(currentCompareSrc !== compareSrc) $(".compareImage").attr("src", compareSrc);
    }
    /*
     * Go through all of the parsing lines and put them into columns;
     * @see linesToColumns()
     * Global Arrray: gatheredColumns
     * 
     */
    function gatherColumns(startIndex){
        var colX,colY,colW,colH;
        var lastColumnLine = -1;
        var linesInColumn = -1;
        var hasTranscription = false;
        if($(".parsing")[startIndex + 1]){
            var line = $(".parsing")[startIndex + 1];
//            //console.log("START");
//            //console.log(line);
            colX = parseFloat($(line).attr("lineleft"));
            colY = parseFloat($(line).attr("linetop"));
            colW = parseFloat($(line).attr("linewidth"));  
            var $lastLine = $(".parsing[lineleft='"+colX+"']:last");
//            //console.log("END");
//            //console.log($lastLine);
            colH = parseFloat($lastLine.attr("linetop"))-colY+parseFloat($lastLine.attr("lineheight"));

            var lastLineIndex = $(".parsing").index($lastLine);
//            //console.log("PUSH TO GATHERED COLUMNS");
            gatheredColumns.push([colX,colY,colW,colH,$(line).attr("lineserverid"),$lastLine.attr("lineserverid"),true]);
//            //console.log("RECURSIVE!");
            gatherColumns(lastLineIndex);
        }
        
        
    }
    function removeColumn(column, destroy){
        ////console.log("Called removed column for this column");
        ////console.log(column);
        if(!destroy){
            if(column.attr("hastranscription")==="true"){
                var cfrm = confirm("This column contains transcription data that will be lost.\n\nContinue?");
                if (!cfrm) return false;
            }
        }
        var colX = column.attr("lineleft");
        // collect lines from column
        var lines = $(".parsing[lineleft='"+colX+"']");;
        lines.addClass("deletable");
        removeColumnTranscriptlets(lines);
        column.remove();
     
    }
    
       
    function destroyPage(){
        nextColumnToRemove = $(".parsingColumn:first");
        var colX = nextColumnToRemove.attr("lineleft");
        var lines = $(".parsing[lineleft='"+colX+"']");
        if(nextColumnToRemove.length > 0){
            removeColumnTranscriptlets(lines, true);
        }
        else{
            $(".destroyPage").html('All Columns Removed');
            cleanupTranscriptlets(true);
            //var newURL = "newberryTrans.html?projectID="+getURLVariable('projectID')+"&p="+getURLVariable('p')+"&liveTool=parsing";
            //window.location.href= newURL;
        }
    }
    
    /* Make parsing interface turn the lines in the view into columns */
    function linesToColumns(){
        //update lines in case of changes
        gatheredColumns = []; //The array built by gatherColumns()
        $(".parsingColumn").remove();
        if ($(".parsing").size() == 0) return false;
        //writeLines($("#imgTop img"));
        //loop through lines to find column dimensions
        var columnParameters = new Array(); // x,y,w,h,startID,endID
        var i = 0;
        var colX,colY,colW,colH;
        var lastColumnLine = -1;
        var linesInColumn = -1;
        gatherColumns(-1); //Gets all columns into an array.
        //build columns
        var columns = [];
        for (j = 0;j<gatheredColumns.length;j++){
            var parseImg = document.getElementById("imgTop").getElementsByTagName("img");
            var scaledX = gatheredColumns[j][0];
            var scaledY = gatheredColumns[j][1];
            var scaledW = gatheredColumns[j][2];
            var scaledH = gatheredColumns[j][3];
//            // recognize, alert, and adjust to out of bounds columns
            if (scaledX+scaledW > 100){
                // exceeded the right boundary of the image
                if (scaledX > 98){
                    scaledX = 98;
                    scaledW = 2;
                } else {
                    scaledW = 100-scaledX-1;
                };
            }
            if (scaledX < 0){
                // exceeded the left boundary of the image
                scaledW += scaledX;
                scaledX = 0;
            }
            if (scaledY+scaledH > 100){
                // exceeded the bottom boundary of the image
                if (scaledY > 98){
                    scaledY = 98;
                    scaledH = 2;
                } else {
                    scaledH = 100-scaledY-1;
                };
            }
            if (scaledY < 0){
                // exceeded the top boundary of the image
                scaledH += scaledY;
                scaledY = 0;
            }
            var startID = $(".parsing[lineleft='"+gatheredColumns[j][0]+"']:first").attr("lineserverid");
            var endID = $(".parsing[lineleft='"+gatheredColumns[j][0]+"']:last").attr("lineserverid");
            columns.push("<div class='parsingColumn' lineleft='",gatheredColumns[j][0],"'",
            " linetop='",gatheredColumns[j][1],"'",
            " linewidth='",gatheredColumns[j][2],"'",
            " lineheight='",gatheredColumns[j][3],"'",
            " hastranscription='",gatheredColumns[j][6]==true,"'",
            " startid='",startID,"'",
            " endid='",endID,"'",
            " style='top:",scaledY,"%;left:",scaledX,"%;width:",scaledW,"%;height:",scaledH,"%;'>",
            "</div>");
        }
        //attach columns
        $(parseImg).before(columns.join(""));
        // avoid events on .lines
        $('#imgTop').find('.parsing').css({
          'z-index': '-10'
        });
        
        $(".parsingColumn")
            .mouseenter(function(){
//                //console.log("mouse enter column");
                var lineInfo;
                lineInfo = $("#transcription"+($(this).index(".parsing")+1)).val();
                $("#lineInfo").empty().text(lineInfo).append("<div>" + $("#t"+($(this).index(".line")+1)).find(".counter").text() +"</div>").show();
                if (!isMagnifying){
                $(this).addClass("jumpLine");
                }
            })
            .mouseleave(function(){
//                //console.log("mouse leave coumn")
                $(".parsing").removeClass("jumpLine");
                $("#lineInfo").hide();
            })
            .click(function(event){
            });
        }
    
    /**
     * Allows for column adjustment in the parsing interface.
     */
     function adjustColumn(event){
        // if(!isMember && !permitParsing)return false;
        //prep for column adjustment
//        //console.log("adjustColumn");
        var thisColumnID = new Array(2);
        var thisColumn;
        var originalX = 1;
        var originalY = 1;
        var originalW = 1;
        var originalH = 1;
        var adjustment = "";
        var column = undefined;
        var originalPercentW;
        var originalPercentX;
        $.each($(".parsingColumn"),function(){
            if($(this).hasClass("ui-resizable")){
                $(this).resizable("destroy");
            }
        });
        $(".parsingColumn").resizable({
            handles     : "n,s,w,e",
            containment : 'parent',
            start       : function(event,ui){
                detachWindowResize();
                $("#progress").html("Adjusting Columns - unsaved").fadeIn();
                $("#columnResizing").show();
                $("#sidebar").fadeIn();
                thisColumn = $(".ui-resizable-resizing");
                thisColumnID = [thisColumn.attr("startid"),thisColumn.attr("endid")];
                adjustment = "new";
                originalPercentW = parseFloat($(this).attr("linewidth"));
                originalPercentX = parseFloat($(this).attr("lineleft"));

            },
            resize      : function(event,ui){
                if(adjustment=="new"){
                    var originalX = ui.originalPosition.left;
                    var originalY = ui.originalPosition.top;
                    var originalW = ui.originalSize.width;
                    var originalH = ui.originalSize.height;
                    var newX = ui.position.left;
                    var newY = ui.position.top;
                    var newW = ui.size.width;
                    var newH = ui.size.height;
                    var offsetForBtm = $(event.target).position().top;
                    if (Math.abs(originalW-newW)>5) adjustment = "right";
                    if (Math.abs(originalH-newH)>5) adjustment = "bottom";
                    if (Math.abs(originalX-newX)>5) adjustment = "left";    // a left change would affect w and x, order matters
                    if (Math.abs(originalY-newY)>5) adjustment = "top";     // a top change would affect h and y, order matters
                    offsetForBtm = (offsetForBtm / $("#imgTop img").height()) * 100;
                    newH = (newH / $("#imgTop img").height()) * 100;
                    var actualBottom = newH + offsetForBtm;                   
                    $("#progress").html("Adjusting "+adjustment+" - unsaved");
                }
            },
            stop        : function(event,ui){
                attachWindowResize();
                $("#progress").html("Column Resized - Saving...");
                $("#parsingCover").show();
                var parseRatio = $("#imgTop img").width() / $("#imgTop img").height();
//                console.log("ratio for adjust");
//                console.log($("#imgTop img").width()+"/"+$("#imgTop img").height());
//                console.log(parseRatio);
                var originalX = ui.originalPosition.left;
                var originalY = ui.originalPosition.top;
                var originalW = ui.originalSize.width;
                var originalH = ui.originalSize.height;
                var newX = ui.position.left;
                var newY = ui.position.top;
                var newW = ui.size.width;
                var newH = ui.size.height;
                var oldHeight, oldTop, oldLeft, newWidth, newLeft;
                //THESE ORIGINAL AND NEW VALUES ARE EVALUATED AS PIXELS, NOT PERCENTAGES
                if (adjustment === "top") {
                    newY = (newY / $("#imgTop img").height()) * 100;
                    originalY = (originalY / $("#imgTop img").height()) * 100;
                    //console.log("top");
                    //save a new height for the top line;
                    var startLine = $(".parsing[lineserverid='"+thisColumnID[0]+"']");
                    oldHeight = parseFloat(startLine.attr("lineheight"));
                    oldTop = parseFloat(startLine.attr("linetop"));

                    //This should be resized right now.  If it is a good resize, the lineheight will be > 0
                    startLine.attr({
                        "linetop"    : newY,
                        "lineheight" : oldHeight + oldTop - newY
                    });
                    startLine.css({
                        "top"    : newY +"%",
                        "height" : oldHeight + oldTop - newY +"%"
                    });
                    
                    if (parseFloat(startLine.attr("lineheight"))<0){
                            // top of the column is below the bottom of its top line
                            var newTopLine = startLine;
                            do {
                                newTopLine = startLine.next('.parsing');
                                removeLine(startLine, true);
                                removeTranscriptlet(startLine.attr("lineserverid"),startLine.attr("lineserverid"), true);
                                startLine = newTopLine;
                                oldHeight = parseFloat(startLine.attr("lineheight"));
                                oldTop = parseFloat(startLine.attr("linetop"));
                                
                            } while (parseFloat(startLine.attr("linetop")) + parseFloat(startLine.attr("lineheight")) < newY );
                            //Got through all the ones that needed removing, now I am on the one that needs resizing.
                            startLine.attr({
                                "linetop"    : newY,
                                "lineheight" : oldHeight + oldTop - newY
                            });
                            startLine.css({
                                "top"    : newY +"%",
                                "height" : oldHeight + oldTop - newY +"%"
                            });
                            thisColumn.attr("startid", startLine.attr("lineserverid"));
                        }
                        else{
                            updateLine(startLine, true, "");
                        }
                        //$("#parsingCover").hide();
                        $("#progress").html("Column Saved").delay(3000).fadeOut(1000);
                    } 
                    else if(adjustment=="bottom"){
                        //console.log("bottom");
                        //technically, we want to track the bottom.  The bottom if the height + top offset
                        var offsetForBtm = $(event.target).position().top;
                        offsetForBtm = (offsetForBtm / $("#imgTop img").height()) * 100;
                        newH = (newH / $("#imgTop img").height()) * 100;
                        
                        var actualBottom = newH + offsetForBtm;
                        //save a new height for the bottom line
                        var endLine = $(".parsing[lineserverid='"+thisColumnID[1]+"']");
                        
                        oldHeight = parseFloat(endLine.attr("lineheight"));
                        oldTop = parseFloat(endLine.attr("linetop"));
                        originalH = (originalH / $("#imgTop img").height()) * 100
                        endLine.attr({
                            "lineheight" : oldHeight + (newH - originalH)
                        });
                        endLine.css({
                            "height" : oldHeight + (newH - originalH) + "%"
                        });
                        if (parseFloat(endLine.attr("linetop")) > actualBottom){
                            //the bottom line isnt large enough to account for the change, delete lines until we get to a  line that, wehn combined with the deleted lines
                            //can account for the requested change.
                            do {
                                oldHeight = parseFloat(endLine.attr("lineheight"));
                                oldTop = parseFloat(endLine.attr("linetop"));
                                var nextline = endLine.prev(".parsing");
                                endLine.remove();
                                removeLine(endLine, true);
                                removeTranscriptlet(endLine.attr("lineserverid"),endLine.attr("lineserverid"), true);                           
                                endLine=nextline;
                            } 
                            while (parseFloat(endLine.attr("linetop"))>actualBottom);
                            
                            var currentLineTop = parseFloat(endLine.attr("linetop"));
                            endLine.attr({
                                "lineheight" : actualBottom - currentLineTop
                            });
                            endLine.css({
                                "height" : actualBottom - currentLineTop + "%"
                            });
                            thisColumn.attr("endid", endLine.attr("lineserverid"));
                        }
                        else{
                            updateLine(endLine, true, "");
                        }
                        //$("#parsingCover").hide();
                        $("#progress").html("Column Saved").delay(3000).fadeOut(1000);
                    }
                    else if(adjustment=="left"){
                            //save a new left,width for all these lines
                            var leftGuide = $(".parsing[lineserverid='"+thisColumnID[0]+"']");
                            oldLeft = parseFloat(leftGuide.attr("lineleft"));
                            var ratio1 = originalPercentW / originalW;
                            var ratio2 = originalPercentX/ originalX;
                            newWidth = newW * ratio1;
                            newLeft = newX * ratio2;
                            $(".parsing[lineleft='"+oldLeft+"']").each(function(){
                                $(this).attr({
                                    "lineleft" : newLeft,
                                    "linewidth": newWidth
                                });
                                $(this).css({
                                    "left" : newLeft + "%",
                                    "width": newWidth + "%"
                                });
                                
                            });
                            updateLinesInColumn(thisColumnID);
                            $("#progress").html("Column Saved").delay(3000).fadeOut(1000);
                            cleanupTranscriptlets(true);
                        } 
                        else if (adjustment=="right"){
                            //save a new width for all these lines
                            var rightGuide = $(".parsing[lineserverid='"+thisColumnID[0]+"']");
                            
                            oldLeft = parseFloat(rightGuide.attr("lineleft"));
                            var ratio = originalPercentW / originalW;
                            newWidth = newW * ratio; //new percent width
                            $(".parsing[lineleft='"+oldLeft+"']").each(function(){
                                $(this).attr({
                                    "linewidth": newWidth
                                });
                                $(this).css({
                                    "width": newWidth + "%"
                                });
                                
                            });
                            updateLinesInColumn(thisColumnID);
                            $("#progress").html("Column Saved").delay(3000).fadeOut(1000);
                            cleanupTranscriptlets(true);                            
                        } else {
                            $("#progress").html("No changes made.").delay(3000).fadeOut(1000);
                        }
                        $("#lineResizing").delay(3000).fadeOut(1000);
                        adjustment = "";
                        
                    }
            });
            $(".parsingColumn").on('resize', function (e) {
                e.stopPropagation();
            });
     }
    
    function reparseColumns(){
        $.each($('.parsingColumn'),function(){
            var colX = $(this).attr("lineleft");
            // collect lines from column
            var lines = $(".parsing[lineleft='"+colX+"']");
            lines.addClass("deletable");
            var linesSize = lines.size();
            // delete from the end, alerting for any deleted data
            for (var i=linesSize; i>0;i--){
                removeLine(lines[i], true);
            }
        });
    }
     
      
   function insertTag(tagName,fullTag){
        if (tagName.lastIndexOf("/") == (tagName.length-1)) {
            //transform self-closing tags
            var slashIndex = tagName.length;
            fullTag = fullTag.slice(0,slashIndex)+fullTag.slice(slashIndex+1,-1)+" />";
        }
        // Check for wrapped tag
        if (!addchar(escape(fullTag),escape(tagName))) {
            closeTag(escape(tagName), escape(fullTag));
        }
        
    }
    
    function closeTag(tagName,fullTag){
            // Do not create for self-closing tags
            if (tagName.lastIndexOf("/") == (tagName.length-1)) return false;
            var tagLineID = focusItem[1].attr("lineserverid");
            var closeTag = document.createElement("div");
            var tagID;
            $.get("tagTracker",{
                addTag      : true,
                tag         : tagName,
                projectID   : projectID,
                //folio       : folio,
                line        : tagLineID
            }, function(data){
                tagID = data;
                $(closeTag).attr({
                    "class"     :   "tags ui-corner-all right ui-state-error",
                    "title"     :   unescape(fullTag),
                    "data-line" :   tagLineID,
                    //"data-folio":   folio,
                    "data-tagID":   tagID
                }).text("/"+tagName);
                focusItem[1].children(".xmlClosingTags").append(closeTag);
            });
        
    }
    
    function addchar(theChar, closingTag)
    {
        //console.log("Add Char Called");
        var closeTag = (closingTag == undefined) ? "" : closingTag;
        var e = focusItem[1].find('textarea')[0];
        if(e!=null) {
            //Data.makeUnsaved();
            return setCursorPosition(e,insertAtCursor(theChar,closeTag,theChar,true));
        }
        return false;
    }
    
    function setCursorPosition(e, position)
    {
        //console.log("set cursor pos.");
        var pos = position;
        var wrapped = false;
        if (pos.toString().indexOf("wrapped") == 0) {
            pos = parseInt(pos.substr(7));
            wrapped = true;
        }
        e.focus();
        if(e.setSelectionRange) {
            e.setSelectionRange(pos,pos);
        }
        else if (e.createTextRange) {
            e = e.createTextRange();
            e.collapse(true);
            e.moveEnd('character', pos);
            e.moveStart('character', pos);
            e.select();
        }
        return wrapped;
    }
    
    /**
     * Inserts value at cursor location.
     *
     * @param myField element to insert into
     * @param myValue value to insert
     * @return int end of inserted value position
     */
     function insertAtCursor(myValue, closingTag, fullTag, specChar) {
         //how do I pass the closing tag in?  How do i know if it exists?
        var myField = focusItem[1].find('.theText')[0];
        var closeTag = (closingTag == undefined) ? "" : unescape(closingTag);
        //IE support
        if(specChar){
             if (document.selection) {
                myField.focus();
                sel = document.selection.createRange();
                sel.text = unescape(myValue);
                //console.log("Need to advance cursor pos by 1..." +sel.selectionStart, sel.selectionStart+1 );
                sel.setSelectionRange(sel.selectionStart+1, sel.selectionStart+1);
                //updateLine($(myField).parent(), false, true);
            }
            //MOZILLA/NETSCAPE support
            else if (myField.selectionStart || myField.selectionStart == '0') {
                var startPosChar = myField.selectionStart;
                var endPos = myField.selectionEnd;
                var currentValue = myField.value;
                currentValue = currentValue.slice(0, startPosChar) + unescape(myValue) + currentValue.slice(startPosChar);
                myField.value = currentValue;
                myField.focus();
                //console.log("Need to advance cursor pos by 1..." +startPosChar, startPosChar+1 );
                myField.setSelectionRange(startPosChar+1, startPosChar+1);
                //updateLine($(myField).parent(), false, true);
            }
            else{
                myField.value += myValue;
            }
        }
        else{ //its an xml tag
            if (document.selection) {
                if(fullTag === ""){
                    fullTag = "<"+myValue+">";
                }
                myField.focus();
                sel = document.selection.createRange();
                sel.text = unescape(fullTag);
                //console.log("Need to advance cursor pos by "+fullTag.length+"..."+sel.selectionStart, sel.selectionStart+fullTag.length);
                sel.setSelectionRange(sel.selectionStart+fullTag.length, sel.selectionStart+fullTag.length);
                //updateLine($(myField).parent(), false, true);
                return sel+unescape(fullTag).length;
            }
            //MOZILLA/NETSCAPE support
            else if (myField.selectionStart || myField.selectionStart == '0') {
                var startPos = myField.selectionStart;
                var endPos = myField.selectionEnd;
                if(fullTag === ""){
                        fullTag = "<" + myValue +">";
                }
                if (startPos !== endPos) {

                    // something is selected, wrap it instead
                    var toWrap = myField.value.substring(startPos,endPos);
                    closeTag = "</" + myValue +">";
                    myField.value =
                          myField.value.substring(0, startPos)
                        + unescape(fullTag)
                        + toWrap
                        + closeTag
                        + myField.value.substring(endPos, myField.value.length);
                    myField.focus();
                    //console.log("Need to put cursor at end of highlighted spot... "+endPos);
                    myField.setSelectionRange(endPos+fullTag.length+closeTag.length, endPos+fullTag.length+closeTag.length);
                    //updateLine($(myField).parent(), false, true);

                }
                else {
                    myField.value = myField.value.substring(0, startPos)
                        + unescape(fullTag)
                        + myField.value.substring(startPos);
                    myField.focus();
                    //console.log("Move caret to startPos + tag length... "+startPos, startPos + fullTag.length);
                    myField.setSelectionRange(startPos+ fullTag.length, startPos+ fullTag.length);
                    //updateLine($(myField).parent(), false, true);
                    //closeAddedTag(myValue, fullTag);
                    return startPos+unescape(fullTag).length;
                }

            }
            else {
                if(fullTag === ""){
                    fullTag = "<"+myValue+">";
                }
                myField.value += unescape(fullTag);
                myField.focus();
                //console.log("Last case... "+myField.selectionStart, myField.selectionStart+ fullTag.length);
                myField.setSelectionRange(myField.selectionStart+ fullTag.length, myField.selectionStart+ fullTag.length);
                //updateLine($(myField).parent(), false, true);
                //closeAddedTag(myValue, fullTag);
                return myField.length;
            }

        }

    }
function toggleCharacters(){
    if($("#charactersPopin .character:first").is(":visible")){
        $("#charactersPopin .character").fadeOut(400);
    }
    else{
       $("#charactersPopin .character").fadeIn(400).css("display", "block"); 
    }
}
function toggleTags(){
    if($("#xmlTagPopin .lookLikeButtons:first").is(":visible")){
        $("#xmlTagPopin .lookLikeButtons").fadeOut(400);
    }
    else{
       $("#xmlTagPopin .lookLikeButtons").fadeIn(400).css("display", "block"); 
    }

}
function togglePageJump(){
    if($("#pageJump .folioJump:first").is(":visible")){
        $("#pageJump .folioJump").fadeOut(400);
    }
    else{
       $("#pageJump .folioJump").fadeIn(400).css("display", "block"); 
    }
}

/* Change the page to the specified page from the drop down selection. */
function pageJump(page,parsing){
    var folioNum = parseInt(page); //1,2,3...
    var canvasToJumpTo = folioNum - 1; //0,1,2...
    if(currentFolio !== folioNum && canvasToJumpTo >= 0){ //make sure the default option was not selected and that we are not jumping to the current folio 
        currentFolio = folioNum;
        if(parsing == "parsing"){
            $(".pageTurnCover").show();
            fullPage();
            focusItem = [null, null];  
            loadTranscriptionCanvas(transcriptionFolios[canvasToJumpTo], parsing);
            setTimeout(function(){
                hideWorkspaceForParsing();
                $(".pageTurnCover").fadeOut(1500);
            }, 800);
        }
        else{
            currentFolio = folioNum;
            focusItem = [null, null];  
            loadTranscriptionCanvas(transcriptionFolios[canvasToJumpTo], "");
        } 
    }
    else{
        //console.log("Loaded current or invalid page");
    }
}

function compareJump(folio){
    populateCompareSplit(folio);
}

/* Change color of lines on screen */
function markerColors(){
    /*
     * This function allows the user to go through annotation colors and decide what color the outlined lines are.
     * colorThisTime
     */
    var tempColorList = ["rgba(153,255,0,.4)", "rgba(0,255,204,.4)", "rgba(51,0,204,.4)", "rgba(204,255,0,.4)", "rgba(0,0,0,.4)", "rgba(255,255,255,.4)", "rgba(255,0,0,.4)"];
    if (colorList.length == 0){
        colorList = tempColorList;
    }
    colorThisTime = colorList[Math.floor(Math.random()*colorList.length)];
    colorList.splice(colorList.indexOf(colorThisTime),1);
    var oneToChange = colorThisTime.lastIndexOf(")") - 2;
    var borderColor = colorThisTime.substr(0, oneToChange) + '.2' + colorThisTime.substr(oneToChange + 1);
    var lineColor = colorThisTime.replace(".4", "1"); //make this color opacity 100
    if(minimalLines){
        $('.lineColIndicator').css('border', '2px solid '+lineColor);
        $('.lineColOnLine').css({'border-left':'1px solid '+borderColor, 'color':lineColor});
        $('.activeLine').css('box-shadow', '0px 9px 5px -5px '+colorThisTime);
    }
    else{
        $('.lineColIndicator').css('border', '2px solid '+lineColor);
        $('.lineColOnLine').css({'border-left':'1px solid '+borderColor, 'color':lineColor});
        $('.activeLine').css('box-shadow', '0px 0px 15px 8px '+lineColor); //keep this color opacity .4 until imgTop is hovered.
    }

}

/* use available functionality to switch between Zen and page defaults for line display. */
function toggleZenLine(){
    if($("#zenLine").hasClass("selected")){
        $("#zenLine").removeClass("selected");
        $("#zenLine").css("background-color", "#272727");
        if($("#minimalLines").hasClass("selected")){
            toggleMinimalLines();
        }
        if(!$("#showTheLines").hasClass("selected")){
            toggleLineMarkers();
        }
        if(!$("#showTheLabels").hasClass("selected")){
            toggleLineCol();
        } 
    }
    else{
        if(!$("#minimalLines").hasClass("selected")){
            toggleMinimalLines();
        }
        if($("#showTheLines").hasClass("selected")){
            toggleLineMarkers();
        }
        if($("#showTheLabels").hasClass("selected")){
            toggleLineCol();
        } 
        $("#zenLine").addClass("selected"); //It is important this happen last here.
    }
    
}

/* Toggle the minimalist line setting */
function toggleMinimalLines(){
    if($("#zenLine").hasClass("selected")){
        $('#zenLine')
        .animate({'background-color':'red'}, 200, 'linear')
        .animate({'background-color':'#8198AA'}, 200, 'easeOutCirc')
        .animate({'background-color':'red'}, 200, 'linear')
        .animate({'background-color':'#8198AA'}, 200, 'easeOutCirc');
        return false;
    }
    minimalLines = !minimalLines;
    if (minimalLines){ //Apply minimal lines settings
        $("#minimalLines").addClass("selected");
        $('.lineColIndicator').addClass("minimal");
        $('.lineColOnLine').addClass("minimal");
        $.each($(".lineColOnLine"), function(){$(this).css("line-height", ($(this).height() * 2)-15 + "px"); });
        $('.activeLine').addClass("minimal");
        $('.activeLine').css('box-shadow', '0px 9px 5px -5px '+colorThisTime);
    }
    else { //remove minimal lines settings
        $("#minimalLines").removeClass("selected");
        $('.lineColIndicator').removeClass("minimal");
        $('.lineColOnLine').removeClass("minimal");
        $.each($(".lineColOnLine"), function(){$(this).css("line-height", $(this).height() + "px"); });
        $('.activeLine').removeClass("minimal");
        $('.activeLine').css('box-shadow', '0px 0px 15px 8px '+colorThisTime);
    }
}

/* Toggle the line/column indicators in the transcription interface. (A1, A2...) */
function toggleLineMarkers(){
    if($("#zenLine").hasClass("selected")){
        $('#zenLine')
        .animate({'background-color':'red'}, 200, 'linear')
        .animate({'background-color':'#8198AA'}, 200, 'easeOutCirc')
        .animate({'background-color':'red'}, 200, 'linear')
        .animate({'background-color':'#8198AA'}, 200, 'easeOutCirc');
        return false;
    }
    if (($('.lineColIndicator:first').is(":visible")&& $('.lineColIndicator:eq(1)').is(":visible"))
            || $("#showTheLines").hasClass("selected")){ //see if a pair of lines are visible just in case you checked the active line first.
        $('.lineColIndicator').hide();
        $(".activeLine").show().addClass("linesHidden");
        $("#showTheLines").removeClass("selected");
    }
    else {
        $('.lineColIndicator').css("display", "block");
        $(".lineColIndicator").removeClass("linesHidden");
        $("#showTheLines").addClass("selected");
        $.each($(".lineColOnLine"), function(){$(this).css("line-height", $(this).height() + "px"); });
    }
}

/* Toggle the drawn lines in the transcription interface. */
function toggleLineCol(){
    if($("#zenLine").hasClass("selected")){
        $('#zenLine')
        .animate({'background-color':'red'}, 200, 'linear')
        .animate({'background-color':'#8198AA'}, 200, 'easeOutCirc')
        .animate({'background-color':'red'}, 200, 'linear')
        .animate({'background-color':'#8198AA'}, 200, 'easeOutCirc');
        return false;
    }
    if ($('.lineColOnLine:first').css("display") === "block"){
        $('.lineColOnLine').hide();
        $("#showTheLabels").removeClass("selected");
    }
    else {
        $('.lineColOnLine').show();
        $("#showTheLabels").addClass("selected");
        if(minimalLines){
            $.each($(".lineColOnLine"), function(){$(this).css("line-height", ($(this).height() * 2)-15 + "px"); });
        }
        else{
            $.each($(".lineColOnLine"), function(){
                $(this).css("line-height", $(this).height() + "px");
            });
        }
    }
}

    //updates lines
    function updateLinesInColumn(column){
        var startLineID = column[0];
        var endLineID = column[1];
        var startLine = $(".parsing[lineserverid='"+startLineID+"']"); //Get the start line
        var nextLine = startLine.next(".parsing"); //Get the next line (potentially)
        var linesToUpdate = [];
        linesToUpdate.push(startLine); //push first line
        while(nextLine.length >0 && nextLine.attr("lineserverid") !== endLineID){ //if there is a next line and its not the last line in the column...
            linesToUpdate.push(nextLine);
            nextLine = nextLine.next(".parsing");
        }
        
        if(startLineID !== endLineID){ //push the last line, so long as it was also not the first line
            linesToUpdate.push($(".parsing[lineserverid='"+endLineID+"']")); //push last line
        }
        columnUpdate(linesToUpdate);  
    }
    
    /* Bulk update for lines in a column. */
    function columnUpdate(linesInColumn){
        //console.log("Doing batch update from column resize")
        var onCanvas = $("#transcriptionCanvas").attr("canvasid");
        currentFolio = parseInt(currentFolio);
        var currentAnnoListID = annoLists[currentFolio - 1];
        var lineTop, lineLeft, lineWidth, lineHeight = 0;
        var ratio = originalCanvasWidth2 / originalCanvasHeight2; 
        var annosURL = "getAnno";
        var properties = {"@id": currentAnnoListID};
        var paramOBJ = {"content": JSON.stringify(properties)};
        //$.post(annosURL, paramOBJ, function(annoLists){
            //console.log("got anno list.  Here are the current resources");
//            try{
//                annoLists = JSON.parse(annoLists);
//            }
//            catch(e){ //may not need to do this here
//                $("#transTemplateLoading p").html("Something went wrong. Could not get annotation lists properly.  Refresh the page to try again.");
//                $('.transLoader img').attr('src',"images/missingImage.png");
//                $(".trexHead").show();
//                $("#genericIssue").show(1000);
//                return false;                
//            }
            var currentAnnoList = transcriptionFolios[currentFolio - 1].otherContent[0]; 
            var currentAnnoListResources = currentAnnoList.resources;
//            $.each(annoLists, function(){
//                if(this.proj === "master"){
//                     currentAnnoListResources =this.resources;
//                }
//                if(this.proj !== undefined && this.proj!=="" && this.proj == theProjectID){
//                    //These are the lines we want to draw because the projectID matches.  Overwrite master if necessary.
//                    //console.log("Lines we wanna draw");
//                    currentAnnoListResources =this.resources;
//                    return false;
//                }
//            });
            //console.log(currentAnnoListResources);
            //Go over each line from the column resize.
            $.each(linesInColumn, function(){
                //console.log("line from column...");
                var line = $(this);
                lineTop = parseFloat(line.attr("linetop")) * 10 ;
                lineLeft = parseFloat(line.attr("lineleft")) * (10*ratio);
                lineWidth = parseFloat(line.attr("linewidth")) * (10*ratio);
                lineHeight = parseFloat(line.attr("lineheight")) * 10;

                //round up.
                lineTop = Math.round(lineTop,0);
                lineLeft = Math.round(lineLeft,0);
                lineWidth = Math.round(lineWidth,0);
                lineHeight = Math.round(lineHeight,0);

                line.css("width", line.attr("linewidth") + "%");

                var lineString = lineLeft+","+lineTop+","+lineWidth+","+lineHeight;
                var currentLineServerID = line.attr('lineserverid');
                var currentLineText = $(".transcriptlet[lineserverid='"+currentLineServerID+"']").find("textarea").val();

                var dbLine = 
                {
                    "@id" : currentLineServerID,
                    "@type" : "oa:Annotation",
                    "motivation" : "sc:painting",
                    "resource" : {
                      "@type" : "cnt:ContentAsText",
                      "cnt:chars" : currentLineText
                    },
                    "on" : onCanvas+"#xywh="+lineString,
                    "otherContent" : [],
                    "forProject": "TPEN_NL"
                };
                
                var index = - 1;
                //find the line in the anno list resources and replace its position with the new line resource.
                //console.log("Need to find line in anno list resources and update the array...");
                $.each(currentAnnoListResources, function(){
                    index++;
                    if(this["@id"] == currentLineServerID){
                        //console.log("found, updating index "+index);
                        transcriptionFolios[currentFolio - 1].otherContent[0].resources[index] = dbLine;
                        return false;
                    }
                });
            
            });
            //Now that all the resources are edited, update the list.
            var url = "updateAnnoList";
            var paramObj = {"@id":currentAnnoListID, "resources": currentAnnoListResources};
            var params = {"content":JSON.stringify(paramObj)};
            //console.log("All resources updated in array.  Write array to DB.");
            //console.log(currentAnnoListResources);
            $.post(url, params, function(data){
                //console.log("list updated with new resources array");
                currentFolio = parseInt(currentFolio);
                annoLists[currentFolio - 1]= currentAnnoListID;
                transcriptionFolios[currentFolio - 1].resources = currentAnnoListResources;
                $("#parsingCover").hide();
            });
                    
    }
    
    /* Update line information for a particular line. */
    function updateLine(line, cleanup){
        var onCanvas = $("#transcriptionCanvas").attr("canvasid");
        currentFolio = parseInt(currentFolio);
        var currentAnnoListID = annoLists[currentFolio - 1];
        var currentAnnoList = "";
        var lineTop, lineLeft, lineWidth, lineHeight = 0;
        var ratio = originalCanvasWidth2 / originalCanvasHeight2; 

        lineTop = parseFloat(line.attr("linetop")) * 10 ;
        lineLeft = parseFloat(line.attr("lineleft")) * (10*ratio);
        lineWidth = parseFloat(line.attr("linewidth")) * (10*ratio);
        lineHeight = parseFloat(line.attr("lineheight")) * 10;
        
        //round up.
        lineTop = Math.round(lineTop,0);
        lineLeft = Math.round(lineLeft,0);
        lineWidth = Math.round(lineWidth,0);
        lineHeight = Math.round(lineHeight,0);
        
        //line.css("width", line.attr("linewidth") + "%");
        var lineString = lineLeft+","+lineTop+","+lineWidth+","+lineHeight;
        var currentLineServerID = line.attr('lineserverid');
        var currentLineText = $(".transcriptlet[lineserverid='"+currentLineServerID+"']").find("textarea").val();
        var dbLine = 
        {
            "@id" : currentLineServerID,
            "@type" : "oa:Annotation",
            "motivation" : "sc:painting",
            "resource" : {
              "@type" : "cnt:ContentAsText",
              "cnt:chars" : currentLineText
            },
            "on" : onCanvas+"#xywh="+lineString,
            "otherContent" : [],
            "forProject": "TPEN_NL"
        };

        if(currentAnnoListID !== "noList" && currentAnnoListID !== "empty"){ // if its IIIF, we need to update the list
                var annoListID = currentAnnoListID;
                currentAnnoList = transcriptionFolios[currentFolio - 1].otherContent[0];
                //console.log(currentAnnoList);
                //console.log("Check list resources...");
                for(var z=0; z<currentAnnoList.resources.length; z++){
                    var lineID = currentAnnoList.resources[z]["@id"];
                    if(lineID == currentLineServerID){
                        //console.log("update current anno list "+annoListID+" index " + index);
                        currentAnnoList.resources[z] = dbLine;
                        var url = "updateAnnoList";
                        var paramObj = {"@id":annoListID, "resources": currentAnnoList.resources};
                        var params = {"content":JSON.stringify(paramObj)};
                        $.post(url, params, function(data){
                            //console.log("list updated");
                            //console.log(currentAnnoList.resources)
                            currentFolio = parseInt(currentFolio);
                            annoLists[currentFolio - 1]= annoListID;
                            transcriptionFolios[currentFolio-1].otherContent[0]=currentAnnoList;
                            $("#parsingCover").hide();
                        });
                        break;
                    }
                }                   
        }
        else if(currentAnnoList == "empty"){
           //cannot update an empty list
        }
        else if(currentAnnoList == "noList"){ //If it is classic T-PEN, we need to update canvas resources
            currentFolio = parseInt(currentFolio);
            var index = -1;
            $.each(transcriptionFolios[currentFolio - 1].otherContent[0].resources, function(){
                index++;
                if(this["@id"] == currentLineServerID){
                    transcriptionFolios[currentFolio - 1].otherContent[0].resources[index] = dbLine;
                }
            });
        }
       if(cleanup !== "no") cleanupTranscriptlets(true);
        //$(".previewLineNumber[lineserverid='"+currentLineServerID+"']").siblings(previewText).html(scrub(line.val()));
    }
    
    
    function saveNewLine(lineBefore, newLine){
        var theURL = window.location.href;
        var projID = -1;
        if(!getURLVariable("projectID")){
            projID = theProjectID;
        }
        else{
            projID = getURLVariable("projectID");
        }
        
        var beforeIndex = -1;
        if(lineBefore !== undefined && lineBefore !== null){
            beforeIndex = parseInt(lineBefore.attr("linenum"));
        }
        var onCanvas = $("#transcriptionCanvas").attr("canvasid");
        var newLineTop, newLineLeft, newLineWidth, newLineHeight = 0;
        var ratio = originalCanvasWidth2 / originalCanvasHeight2; 
        newLineTop = parseFloat(newLine.attr("linetop"));
        newLineLeft = parseFloat(newLine.attr("lineleft"));
        newLineWidth = parseFloat(newLine.attr("linewidth"));
        newLineHeight = parseFloat(newLine.attr("lineheight"));
        
        newLineTop = newLineTop * 10 ;
        newLineLeft = newLineLeft * (10*ratio);
        newLineWidth = newLineWidth * (10*ratio);
        newLineHeight = newLineHeight * 10;
        
        //round up.
        newLineTop = Math.round(newLineTop , 0);
        newLineLeft = Math.round(newLineLeft,0);
        newLineWidth = Math.round(newLineWidth,0);
        newLineHeight = Math.round(newLineHeight,0);
                       
        var lineString = onCanvas + "#xywh=" +newLineLeft+","+newLineTop+","+newLineWidth+","+newLineHeight;
        var currentLineText = "";
        var dbLine = 
            {
                "@id" : "",
                "@type" : "oa:Annotation",
                "motivation" : "sc:painting",
                "resource" : {
                  "@type" : "cnt:ContentAsText",
                  "cnt:chars" : currentLineText
                },
                "on" : lineString,
                "otherContent":[],
                "forProject": "TPEN_NL"
            }
        ;
        var url = "saveNewTransLineServlet";
        var paramOBJ = dbLine;
        var params = {"content" : JSON.stringify(paramOBJ)};
//        //console.log("saving new line...");
        if(onCanvas !== undefined && onCanvas !== ""){
            $.post(url, params, function(data){
                   //console.log("saved new line");
                   //console.log(data);
                    try{
                        data = JSON.parse(data);
                    }
                    catch(e){ //may not need to do this here
                        $("#transTemplateLoading p").html("Something went wrong. Did not save a line correctly.  Refresh the page to try again.");
                        $('.transLoader img').attr('src',"images/missingImage.png");
                        $(".trexHead").show();
                        $("#genericIssue").show(1000);
                        console.warn("I could not parse return from save new line.");

                        return false;                
                    }
                    dbLine["@id"] = data["@id"];
                    newLine.attr("lineserverid", data["@id"]);
                    $("div[newcol='"+true+"']").attr({
                        "startid" : dbLine["@id"],
                        "endid" : dbLine["@id"],
                        "newcol":false
                    });
                    currentFolio = parseInt(currentFolio);
                    var currentAnnoList = annoLists[currentFolio - 1];
                    if(currentAnnoList !== "noList" && currentAnnoList !== "empty"){ // if it IIIF, we need to update the list
                        var annosURL = "getAnno";
                        var properties = {"@id": currentAnnoList};
                        var paramOBJ = {"content": JSON.stringify(properties)};
                            var annoListID = currentAnnoList;
                            currentAnnoList = transcriptionFolios[currentFolio -1].otherContent[0];
                            if(beforeIndex == -1){
                                $(".newColumn").attr({
                                    "lineserverid" : dbLine["@id"],
                                    "startid" : dbLine["@id"],
                                    "endid" : dbLine["@id"],
                                    "linenum" : $(".parsing").length
                                }).removeClass("newColumn");
                                currentAnnoList.resources.push(dbLine);
                            }
                            else{
                                currentAnnoList.resources.splice(beforeIndex + 1, 0, dbLine);
                            }
                            transcriptionFolios[currentFolio -1].otherContent[0] = currentAnnoList;
                            currentFolio = parseInt(currentFolio);
                            annoLists[currentFolio - 1] = annoListID;
                            //Write back to db to update list
                            var url1 = "updateAnnoList";
                            var paramObj1 = {"@id":annoListID, "resources": currentAnnoList.resources};
                            var params1 = {"content":JSON.stringify(paramObj1)};
                            if(lineBefore !== undefined && lineBefore !== null){
                                //This means we haved saved a new line in a column.  Dont update the list yet, that will happen in updateLine();  Everything else is cached.
                                //console.log("saved a new line in a column or mergeness happened.  Saved new line, now update a line, and in that update hide the parsing cover.  ")
                                updateLine(lineBefore);
                            }
                            else{
                                //console.log("We just saved a new line with column creation, so no update needs to be called");
                                $.post(url1, params1, function(data){
                               //console.log("Updated list on anno store");
                                });
                                $("#parsingCover").hide();
                            }
                }
                else if(currentAnnoList == "empty"){ 
                    //This means we know no AnnotationList was on the store for this canvas, and otherContent stored with the canvas object did not have the list.  Make a new one in this case. 
                      var newAnnoList = 
                        {
                            "@type" : "sc:AnnotationList",
                            "on" : onCanvas,
                            "originalAnnoID" : "",
                            "version" : 1,
                            "permission" : 0,
                            "forkFromID" : "",
                            "resources" : [dbLine],
                            "proj" : projID
                        };
                    var url2 = "saveNewTransLineServlet";
                    var params2 = {"content": JSON.stringify(newAnnoList)};
                    $.post(url2, params2, function(data){ //save new list
    //                    //console.log("new list made");
                        try{
                            data = JSON.parse(data);
                        }
                        catch(e){ //may not need to do this here
                            $("#transTemplateLoading p").html("Something went wrong. Did not save a line correctly.  Refresh the page to try again.");
                            $('.transLoader img').attr('src',"images/missingImage.png");
                            $(".trexHead").show();
                            $("#genericIssue").show(1000);
                        console.warn("I could not the return from save new line.");

                            return false;                
                        }
                        var newAnnoListCopy = newAnnoList;
                        newAnnoListCopy["@id"] = data["@id"];
                        currentFolio = parseInt(currentFolio);
                        annoLists[currentFolio - 1] = newAnnoListCopy["@id"];
                        transcriptionFolios[currentFolio - 1].otherContent[0] = newAnnoListCopy;
                        $(".newColumn").attr({
                            "lineserverid" : dbLine["@id"],
                            "startid" : dbLine["@id"],
                            "endid" : dbLine["@id"],
                            "linenum" : $(".parsing").length
                        }).removeClass("newColumn");
                        newLine.attr("lineserverid", dbLine["@id"]);
                        console.log("added line into new list, so I can hide cover.");
                        $("#parsingCover").hide();
                    });
                }
                else if(currentAnnoList == "noList"){ //noList is a special scenario, it is depricated at this point.
                    if(beforeIndex == -1){ //New line vs new column
                        $(".newColumn").attr({
                            "lineserverid" : dbLine["@id"],
                            "startid" : dbLine["@id"],
                            "endid" : dbLine["@id"],
                            "linenum" : $(".parsing").length
                        }).removeClass("newColumn");
                        currentFolio = parseInt(currentFolio);
                        transcriptionFolios[currentFolio - 1].otherContent[0].resources.push(dbLine);
                    }
                    else{
                        currentFolio = parseInt(currentFolio);
                        transcriptionFolios[currentFolio - 1].resources.splice(beforeIndex + 1, 0, dbLine);
                    }
                    $("#parsingCover").hide();
                    //should we write to the DB here?  This would be in support of old data.  
                }
                console.log("call cleanup from save line");
                cleanupTranscriptlets(true);
            });
        }
        else{
            alert("Cannot save line.  Canvas id is not present.");
        }
        
    }
   
    /**
     * Inserts new transcriptlet when line is added.
     * Cleans up inter-transcriptlet relationships afterwards.
     * 
     * @param e line element to build transcriptlet from
     * @param afterThisID lineid of line before new transcriptlet
     * @param newLineID lineid of new line
     */
     function buildTranscriptlet(e, afterThisID, newServerID){
        var newLineID = $(".transcriptlet").length + 1;
        var isNotColumn = true;
        var newW = e.attr("linewidth");
        var newX = e.attr("lineleft");
        var newY = e.attr("linetop");
        var newH = e.attr("lineheight");
        if (afterThisID === -1) {
          // new column, find its placement
          afterThisID = $(".transcriptlet").eq(-1).attr("lineserverid") || -1;
          $(".transcriptlet").each(function(index) {
            if ($(this).find('lineLeft') > newX) {
              afterThisID = (index > 0) ? $(this).prev('.transcriptlet').attr("lineserverid") : -1;
              return false;
            }
          });
            isNotColumn = false;
        } 
        var $afterThis = $(".transcriptlet[lineserverid='"+afterThisID+"']");
        var newTranscriptlet = [
            "<div class='transcriptlet transcriptletBefore' id='transciptlet_",newLineID,
            "' lineserverid='",newServerID, // took out style DEBUG
            "lineheight= ",newH,
            "linewidth= ",newW,
            "linetop= ",newY,
            "lineleft= ",newX,
            "lineid= ", ,
            "col= ", ,
            "collinenum= ", ,
            "'>\n",
            "<span class='counter wLeft ui-corner-all ui-state-active ui-button'>Inserted Line</span>\n",
            "<textarea></textarea>\n",
            "</div>"];
        if (isNotColumn){
            //update transcriptlet that was split
            $afterThis.after(newTranscriptlet.join("")).find(".lineHeight").val($(".parsing[lineserverid='"+afterThisID+"']").attr("lineheight"));                    
        } 
        else {
            if (afterThisID === -1) {
            $   ("#entry").prepend(newTranscriptlet.join(""));
            } 
            else {
                    $afterThis.after(newTranscriptlet.join(""));
            }
        }
        $(e).attr("lineserverid", newServerID);
        
    }
    /**
     * Adds a line by splitting the current line where it was clicked.
     * 
     * @param e clicked line element
     * @see organizePage(e)
     */
     function splitLine(e,event){        
        //e is the line that was clicked in
        //This is where the click happened relative to img top.  In other words, where the click happened among the lines. 
        var originalLineHeight = $(e).height(); //-1 take one px off for the border
        $(".parsing").attr("newline", "false");
        var originalLineTop = $(e).offset().top - $("#imgTop").offset().top; // +1 Move down one px for the border.  
        //var originalLineTop = parseFloat($(e).css("top"));
        var clickInLines = event.pageY - $("#imgTop").offset().top;
        var lineOffset = $(e).offset().top - $("#imgTop").offset().top;
        var oldLineHeight = (clickInLines - lineOffset)/$("#imgTop").height() * 100;
        //var oldLineHeight = parseFloat($(e).css("height"));
        var newLineHeight = (originalLineHeight - (clickInLines - originalLineTop))/$("#imgTop").height() * 100;
        var newLineTop = (clickInLines/$("#imgTop").height()) * 100;
        var newLine = $(e).clone(true);
        
         $(e).css({
            "height"    :   oldLineHeight + "%"
        }).attr({
            "newline"   :   true,
            "lineheight" :  oldLineHeight
        });
              
        $(newLine).css({
            "height"    :   newLineHeight + "%",
            "top"       :   newLineTop + "%"
        }).attr({
            "newline"   :   true,
            "linetop"   :   newLineTop,
            "lineheight" : newLineHeight
        });
        
        $(e).after(newLine);
        var newNum = -1;
        $.each($(".parsing"), function(){
            newNum++;
            $(this).attr("linenum", newNum);
        });        
         saveNewLine($(e),newLine); 
        $("#progress").html("Line Added").fadeIn(1000).delay(3000).fadeOut(1000);
    }
    
    /**
 * Removes clicked line, merges if possible with the following line.
 * updateLine(e,additionalParameters) handles the original, resized line.
 *
 * @param e clicked line element from lineChange(e) via saveNewLine(e)
 * @see lineChange(e)
 * @see saveNewLine(e)
 */
    function removeLine(e, columnDelete, deleteOnly){
        $("#imageTip").hide();
        var removedLine = $(e);
        if (columnDelete){
            var lineID = "";
            removedLine.remove();
            return false;
        }
        else {
            if ($(e).attr("lineleft") == $(e).next(".parsing").attr("lineleft")) { //merge
                if(!deleteOnly){ //if user clicked to remove a line, then do not allow merging.  Only delete the last line.
                    removedLine = $(e).next();
                    var removedLineHeight = removedLine.attr("lineheight");
                    var currentLineHeight = $(e).attr("lineheight");
                    var newLineHeight = parseFloat(removedLineHeight) + parseFloat(currentLineHeight);
                    //var convertedNewLineHeight = newLineHeight / $("#imgTop").height() * 100;
                    var convertedNewLineHeight = newLineHeight;
                    var transcriptletToUpdate = $(".transcriptlet[lineserverid='"+$(e).attr('lineserverid')+"']");
                    $(e).css({
                        "height" :  convertedNewLineHeight + "%",
                        "top" :     $(e).css("top")
                    }).addClass("newDiv").attr({
                        "lineheight":   convertedNewLineHeight
                    });
                    transcriptletToUpdate.attr("lineheight", convertedNewLineHeight); //Need to put this on the transcriptlet so updateLine() passes the correct value. 
                }
                else{ //User is trying to delete a line that is not the last line, do nothing
                    $("#parsingCover").hide();
                    return false;
                }
            }
            else{ //user is deleting a line, could be merge or delete mode
                if(deleteOnly){ //this would mean it is delete happening in delete mode, so allow it.

                }
                else{ //this would mean it is a delete happening in merge mode.
                    alert("To delete a line, deactivate 'Merge Lines' and activate 'Remove Last Line'.");
                    $("#parsingCover").hide();
                    return false;
                }
            }
            var params = new Array({name:"remove", value:removedLine.attr("lineserverid")});

            if(deleteOnly){ //if we are in delete mode deleting a line
                if($(e).hasClass("deletable")){
                    var cfrm = confirm("Removing this line will remove any data contained as well.\n\nContinue?");
                    if (!cfrm){
                        $("#parsingCover").hide();
                        return false;
                    }
                    removeTranscriptlet(removedLine.attr("lineserverid"), $(e).attr("lineserverid"), true, "cover");
                    removedLine.remove();
                    return params;
                }
                else{
                    $("#parsingCover").hide();
                    return false;
                }
            }
            else{ //we are in merge mode merging a line, move forward with this functionality.
                removeTranscriptlet(removedLine.attr("lineserverid"), $(e).attr("lineserverid"), true, "cover");
                removedLine.remove();
                //$("#parsingCover").hide();
                return params;
            }

        }
    }
    
     /**
     * Removes transcriptlet when line is removed. Updates transcriplet
     * if line has been merged with previous.
     * 
     * @param lineid lineid to remove
     * @param updatedLineID lineid to be updated
     */
     function removeTranscriptlet(lineid, updatedLineID, draw, cover){
        // if(!isMember && !permitParsing)return false;
        //update remaining line, if needed
        $("#parsingCover").show();
        var updateText = "";
        console.log("is the id of the line clicked "+updatedLineID+" == the next line "+lineid);
        var removeNextLine = false;
        if (lineid !== updatedLineID){
            console.log("No it isn't. merge");
            removeNextLine = true;
            var removedLine1 = $(".parsing[lineserverid='"+lineid+"']");
            var removedLine2 = $(".transcriptlet[lineserverid='"+lineid+"']");
            var toUpdate =   $(".transcriptlet[lineserverid='"+updatedLineID+"']");
            var removedText =   $(".transcriptlet[lineserverid='"+lineid+"']").find("textarea").val();
            if(toUpdate.length === 0){ 
                //cleanupTranscriptlets() at the end of this function has removed all trascriptlets.  Check if parsing line exists, there will be no text.
                toUpdate = $(".parsing[lineserverid='" + updatedLineID + "']");
            }
            if(removedLine2.length === 0){ 
                //cleanupTranscriptlets() at the end of this function has removed all trascriptlets.  Check if parsing line exists, there will be no text.
                removedLine2 = removedLine1;
            }
            //If toUpdate or removedLine2 are of length 0 at this point, there will be an error because I will not have ID's to talk to the db with.
            if(toUpdate.length ==0 || removedLine2.length ==0){
                console.warn("I could not find the lines to perform this action with, it has gone unsaved.");
                $(".trexHead").show();
                $("#genericIssue").show(1000);
                console.warn("Did not know line to remove.");

                return false;
            }
            toUpdate.find("textarea").val(function(){
                var thisValue = $(this).val();
                if (removedText !== undefined){
                   if(removedText !== "") thisValue += (" "+removedText);
                    updateText = thisValue;
                }
                return thisValue;
            });

        }
        else{
            //console.log("yes it is. delete!");
        }

        var index = -1;
        currentFolio = parseInt(currentFolio);
        var currentAnnoList = annoLists[currentFolio -1];
         if(currentAnnoList !== "noList" && currentAnnoList !== "empty"){ // if it IIIF, we need to update the list
                var currentAnnoList = transcriptionFolios[currentFolio-1].otherContent[0];
                var annoListID = currentAnnoList["@id"];
                console.log("got it");
                //console.log(currentAnnoList.resources);
                for (var z=0; z<currentAnnoList.resources.length; z++){
                    var lineIDToCheck = "";
                    if(removeNextLine){
                        lineIDToCheck = lineid;
                        removedLine2.remove(); //remove the transcriptlet from UI
                    }
                    else{
                        lineIDToCheck = updatedLineID;
                    }
                    console.log(currentAnnoList.resources[z]["@id"]+" == "+lineIDToCheck+"?  Index = "+z);
                    if(currentAnnoList.resources[z]["@id"] === lineIDToCheck){
                        currentAnnoList.resources.splice(z, 1);
                        console.log("Delete from list " + lineIDToCheck+" at index "+z+".  Then update with line removed.");
                        console.log(currentAnnoList.resources);
                        var url = "updateAnnoList";
                        var paramObj = {"@id":annoListID, "resources": currentAnnoList.resources};
                        var params = {"content":JSON.stringify(paramObj)};
                        if(!removeNextLine){
                            $.post(url, params, function(data){
                                //console.log("update from delete finished");
                                currentFolio = parseInt(currentFolio);
                                annoLists[currentFolio - 1] = annoListID;
                                $("#parsingCover").hide();
                            });
                            
                        }
                        else{
                            console.log("now we have to update the line that was clicked with the new line height from the one we removed.")
                            updateLine(toUpdate);
                        }
                        break;
                    }
                }                                         
            //});
        }
        else if(currentAnnoList == "empty"){
            //There is no anno list assosiated with this anno.  This is an error.
        }
        else{ //If it is classic T-PEN, we need to update canvas resources
            currentFolio = parseInt(currentFolio);
            $.each(transcriptionFolios[currentFolio - 1].otherContent[0].resources, function(){
                index++;
                if(this["@id"] == lineid){
                    transcriptionFolios[currentFolio - 1].resources.otherContent[0].splice(index, 1);
                    return false;
                    //update forreal
                }
            });
        } 
        //When it is just one line being removed, we need to redraw.  When its the whole column, we just delete. 
        console.log("call cleanup from remove.  Draw: "+draw);
        cleanupTranscriptlets(draw);
    
     }
     
     /* Remove all transcriptlets in a column */
     function removeColumnTranscriptlets(lines, recurse){
        var index = -1;
        currentFolio = parseInt(currentFolio);
        var currentAnnoList = annoLists[currentFolio -1];
        //console.log("removing transcriptlets from this list");
        //console.log(currentAnnoList);
         if(currentAnnoList !== "noList" && currentAnnoList !== "empty"){ // if it IIIF, we need to update the list
        //console.log("Get annos for column removal");
                currentAnnoList = transcriptionFolios[currentFolio-1].otherContent[0];
                var annoListID = currentAnnoList["@id"];
                //console.log("got them");
                //console.log(currentAnnoList.resources);
                for(var l=lines.length-1; l>=0; l--){
                    var theLine = $(lines[l]);
                    var index2 = -1;
                     $.each(currentAnnoList.resources, function(){
                        var currentResource = this;
                        index2++;
                        //console.log(currentResource["@id"] +" == "+ theLine.attr("lineserverid")+"?")
                        if(currentResource["@id"] == theLine.attr("lineserverid")){
                            currentAnnoList.resources.splice(index2, 1);
                            //console.log(theLine);
                            //console.log("Delete from list " + theLine.attr("lineserverid")+" at index "+index2+".");
                            theLine.remove();
                        }
                     });

                    if(l===0){
                        //console.log("last line in column, update list");
                        //console.log(currentAnnoList.resources);
                        var url = "updateAnnoList";
                        var paramObj = {"@id":annoListID, "resources": currentAnnoList.resources};
                        var params = {"content":JSON.stringify(paramObj)};
                        $.post(url, params, function(data){
                            //console.log("update from delete finished");
                            annoLists[currentFolio - 1] = annoListID;
                            transcriptionFolios[currentFolio -1].otherContent[0] = currentAnnoList;
                            if(recurse){
                                nextColumnToRemove.remove();
                                destroyPage();
                            }
                            else{
                                console.log("call cleanup from update");
                                cleanupTranscriptlets(true);
                            }

                        });
                    }
                }
                
         }
         else{
             //It was not a part of the list, but we can still cleanup the transcriptlets from the interface.  This could happen when a object is fed to the 
             //transcription textarea who instead of using an annotation list used the resources[] field to store anno objects directly with the canvas.  
             //These changes will not save, they are purely UI manipulation.  An improper, view only object has been fed to the interface at this point, so this is intentional.
             for(var l=lines.length-1; l>=0; l--){
                  var theLine = $(lines[l]);
                  theLine.remove();
                  var lineID = theLine.attr("lineserverid");
                  //console.log("remove this line: "+lineID);
                  //console.log("remove tramscriptlets");
                  $(".transcriptlet[lineserverid='"+lineID+"']").remove(); //remove the transcriptlet
                  //console.log("remove trans drawn lines");
                  $(".lineColIndicator[lineserverid='"+lineID+"']").remove(); //Remove the line representing the transcriptlet
                  //console.log("remov preview line");
                  $(".previewLineNumber[lineserverid='"+lineID+"']").parent().remove(); //Remove the line in text preview of transcription.
                }
         }
         
     }
    
    /* Re draw transcriptlets from the Annotation List information. */
    function cleanupTranscriptlets(draw) {
        console.log("cleanup.  draw:"+draw);
        var transcriptlets = $(".transcriptlet");
          if(draw){
              transcriptlets.remove();
              $(".lineColIndicatorArea").children(".lineColIndicator").remove();
              $("#parsingSplit").find('.fullScreenTrans').unbind();
              $("#parsingSplit").find('.fullScreenTrans').bind("click", function(){
                fullPage(); 
                currentFolio = parseInt(currentFolio);
                drawLinesToCanvas(transcriptionFolios[currentFolio-1], "");
              });
          }

    }
 
 /* Make some invalid information inside of folios valid empties */
function scrubFolios(){
    //you could even force create anno lists off of the existing resource here if you would like.  
    var cnt1 = -1;
    $.each(transcriptionFolios, function(){
        cnt1++;
        var canvasObj = this;
        if(canvasObj.resources && canvasObj.resources.length > 0){
            //alert("Canvas "+canvasObj["@id"]+" does not contain any transcription lines.");
            if(canvasObj.images === undefined || canvasObj.images === null){
                canvasObj.images = [];
            }
            var cnt2 = -1;
            $.each(canvasObj.resources, function(){
                    cnt2 += 1;
                    if(this.resource && this.resource["@type"] && this.resource["@type"] === "dctypes:Image"){
                        canvasObj.images.push(this);
                        canvasObj.resources.splice(cnt2,1);
                        transcriptionFolios[cnt1] = canvasObj;
                    }
                });
        }
        if(canvasObj.otherContent === undefined){
            transcriptionFolios[cnt1].otherContent = [];
        }
        });
}

/* Control the hiding and showing of the image tools in the transcription interface. */
//function toggleImgTools(){
//    if($("#imageTools").attr("class")!==undefined && $("#imageTools").attr("class").indexOf("activeTools") > -1){
//        $('.toolWrap').hide();
//        $("#imageTools").removeClass("activeTools");
//        $("#activeImageTool").children("i").css("transform", "rotate(180deg)");
//    }
//    else{
//        $("#imageTools").addClass("activeTools");
//        $('.toolWrap').show();
//        $("#activeImageTool").children("i").css("transform", "rotate(0deg)");
//    }
//}

function stopMagnify(){
    isMagnifying = false;
    zoomMultiplier = 2;
    $(document).off("mousemove");
    $("#zoomDiv").removeClass("ui-state-active");
    $("#zoomDiv").hide();
    $(".magnifyBtn").removeClass("ui-state-active");
    $("#magnifyTools").fadeOut(800);
//                    $("#imgBottom img").css("top", imgBottomOriginal);
//                    $("#imgBottom .lineColIndicatorArea").css("top", imgBottomOriginal);
    $(".lineColIndicatorArea").show();
    $(".magnifyHelp").hide();
    $("button[magnifyimg='full']").removeClass("selected");
    $("button[magnifyimg='compare']").removeClass("selected");
    $("button[magnifyimg='trans']").removeClass("selected");
    restoreWorkspace();
}

/*
 * Load all included Iframes on the page.  This function should be strategically placed so that the Iframes load after user and project information
 * are gathered.  This should help avoid timeouts caused by embedded Iframes wait times mixed with many calls to the annotation store and calls for images.
 * See the Network console in the Browser deveoper tools for problems with wait times on embedded content.  
 * 
 * @see newberryTrans.html to find the iframe elements.
 */
function loadIframes(){
//    $.each($("iframe"), function(){
//        var src = $(this).attr("data_src");
//        $(this).attr("src",src);
//    });
}

/* Clear the resize function attached to the window element. */
    function detachWindowResize(){
        window.onresize = function(event, ui){
        };
    }
    
    function detachTemplateResize(){
        if ($("#transcriptionTemplate").hasClass("ui-resizable")){
            $("#transcriptionTemplate").resizable("destroy");
        }
        //$("#transcriptionTemplate").resizable("destroy");
    }
    
    function attachTemplateResize(){
        var originalRatio = originalCanvasWidth / originalCanvasHeight;
        $("#transcriptionTemplate").resizable({
            handles:"e",
            disabled:false,
            minWidth: window.innerWidth / 2,
            maxWidth: window.innerWidth * .75,
            start: function(event, ui){
                detachWindowResize();
            },
            resize: function(event, ui) {
                var width = ui.size.width;
                var height = 1 / originalRatio * width;
                $("#transcriptionCanvas").css("height", height + "px").css("width", width + "px");
                $(".lineColIndicatorArea").css("height", height + "px");
                var splitWidth = window.innerWidth - (width + 35) + "px";
                $(".split img").css("max-width", splitWidth);
                $(".split:visible").css("width", splitWidth);
                //var newHeight1 = parseFloat($("#fullPageImg").height()) + parseFloat($("#fullpageSplit .toolLinks").height()); //For resizing properly when transcription template is resized
                //var newHeight2 = parseFloat($(".compareImage").height()) + parseFloat($("#compareSplit .toolLinks").height()); //For resizing properly when transcription template is resized
                var fullPageMaxHeight = window.innerHeight - 15; //100 comes from buttons above image and topTrim
                $("#fullPageImg").css("max-height", fullPageMaxHeight); //If we want to keep the full image on page, it cant be taller than that.
                $("#fullPageSplitCanvas").height($("#fullPageImg").height());
                $("#fullPageSplitCanvas").width($("#fullPageImg").width());
                var newImgBtmTop = imgBottomPositionRatio * height;
                var newImgTopTop = imgTopPositionRatio * height;
                $("#imgBottom img").css("top", newImgBtmTop + "px");
                $("#imgBottom .lineColIndicatorArea").css("top", newImgBtmTop + "px");
                $("#imgTop img").css("top", newImgTopTop + "px");
                $("#imgTop .lineColIndicatorArea").css("top", newImgTopTop + "px");
            },
            stop: function(event, ui){
                attachWindowResize();
                if(minimalLines){
                    $.each($(".lineColOnLine"), function(){$(this).css("line-height", ($(this).height() * 2)-15 + "px"); });
                }
                else{
                    $.each($(".lineColOnLine"), function(){
                        $(this).css("line-height", $(this).height() + "px");
                    });
                }
                textSize();
            }
        });
        $("#transcriptionTemplate").on('resize', function (e) {
            e.stopPropagation();
        });
    }

    //Must explicitly set new height and width for percentages values in the DOM to take effect.
    //with resizing because the img top position puts it up off screen a little.
    function attachWindowResize(){
        window.onresize = function(event, ui) {
            detachTemplateResize();
            event.stopPropagation();
            var newImgBtmTop = "0px";
            var newImgTopTop = "0px";
            var ratio = originalCanvasWidth / originalCanvasHeight;
            var newCanvasWidth = $("#transcriptionCanvas").width();
            var newCanvasHeight = $("#transcriptionCanvas").height();
            var PAGEHEIGHT = Page.height();
            var PAGEWIDTH = Page.width();
            var widerThanTall = (parseInt(originalCanvasWidth) > parseInt(originalCanvasHeight));
            var splitWidthAdjustment = window.innerWidth - (newCanvasWidth + 35) + "px";  
            var parsingMaxHeight = PAGEHEIGHT - 35;
            if(liveTool === 'parsing'){
                var SPLITWIDTH = $("#parsingSplit").width();
                if(screen.width == $(window).width() && screen.height == window.outerHeight){
                    $(".centerInterface").css("text-align", "center"); //.css("background-color", "#e1f4fe");
                }
                else{
                    $(".centerInterface").css("text-align", "left"); //.css("background-color", "#e1f4fe");
                }
                if(PAGEHEIGHT <= 625){ //This is the smallest height we allow, unless the image is widerThanTall
                    if(!widerThanTall){
                        newCanvasHeight = 625;
                    }
                }
                else if (PAGEHEIGHT <= originalCanvasHeight){ //allow it to be as tall as possible, but not taller.
                    newCanvasHeight = parsingMaxHeight;
                    newCanvasWidth = ratio*newCanvasHeight;
                }
                else if(PAGEHEIGHT > originalCanvasHeight){ //I suppose this is possible for small images, so handle if its trying to be bigger than possible
                    newCanvasHeight = originalCanvasHeight;
                    newCanvasWidth = originalCanvasWidth;
                }

                if(PAGEWIDTH > 900){ //Whenever it is greater than 900 wide
                    if (PAGEWIDTH < newCanvasWidth + SPLITWIDTH){ //If the page width is less than that of the image width plus the split area
                        newCanvasWidth = PAGEWIDTH - SPLITWIDTH; //make sure it respects the split area's space
                        newCanvasHeight = 1/ratio*newCanvasWidth; //make the height of the canvas relative to this width
                        if(newCanvasHeight > parsingMaxHeight){
                            newCanvasHeight = parsingMaxHeight;
                            newCanvasWidth = ratio * newCanvasHeight;
                        }
                    }
                    if(widerThanTall){
                        $("#parsingSplit").show();
                    }
                }
                else{ //Whenever it is less than 900 wide
                    if(widerThanTall){ //if the image is wider than tall
                        newCanvasWidth = 900; //make it as wide as the limit.  The split area is hidden, we do not need to take it into account
                        newCanvasHeight = 1/ratio*newCanvasWidth; //make the height of the image what it needs to be for this width limit
                        if(newCanvasHeight > parsingMaxHeight){
                            newCanvasHeight = parsingMaxHeight;
                            newCanvasWidth = ratio * newCanvasHeight;
                        }
                        $("#parsingSplit").hide();
                    }
                    else{
                        //The math above will have done everything right for all the areas of an image that is taller than it is wide. 
                    }
                }

                $("#transcriptionCanvas").css("height", newCanvasHeight + "px");
                $("#transcriptionCanvas").css("width", newCanvasWidth + "px");
                $("#imgTop").css("height", newCanvasHeight + "px");
                $("#imgTop").css("width", newCanvasWidth + "px");
                $("#imgTop img").css({
                    'height': newCanvasHeight + "px",
                });
            } 
            else if (liveTool === "preview"){
                $("#previewSplit").show().height(Page.height()-$("#previewSplit").offset().top).scrollTop(0); // header space
                $("#previewDiv").height(Page.height()-$("#previewDiv").offset().top);
                $(".split img").css("max-width", splitWidthAdjustment);
                $(".split:visible").css("width", splitWidthAdjustment);
            }
            else if(liveTool !== "" && liveTool!=="none"){
                newCanvasWidth = Page.width() * .55;
                var splitWidth = window.innerWidth - (newCanvasWidth + 35) + "px";
                if(liveTool === "controls"){
                    newCanvasWidth = Page.width()-200;
                    splitWidth = 200;
                }
                newCanvasHeight = 1 / ratio * newCanvasWidth;
                var fullPageMaxHeight = window.innerHeight - 125; //120 comes from buttons above image and topTrim
                $(".split img").css("max-width", splitWidth);
                $(".split:visible").css("width", splitWidth);
                $("#fullPageImg").css("max-height", fullPageMaxHeight); //If we want to keep the full image on page, it cant be taller than that.
                $("#fullPageSplitCanvas").css("height", $("#fullPageImg").height());
                $("#fullPageSplitCanvas").css("height", $("#fullPageImg").width());
                $("#transcriptionTemplate").css("width", newCanvasWidth + "px");
                $("#transcriptionCanvas").css("width", newCanvasWidth + "px");
                $("#transcriptionCanvas").css("height", newCanvasHeight + "px");
                newImgTopTop = imgTopPositionRatio * newCanvasHeight;
                $("#imgTop img").css("top", newImgTopTop + "px");
                $("#imgTop .lineColIndicatorArea").css("top", newImgTopTop + "px");
                $("#imgBottom img").css("top", newImgBtmTop + "px");
                $("#imgBottom .lineColIndicatorArea").css("top", newImgBtmTop + "px");
                $(".lineColIndicatorArea").css("height",newCanvasHeight+"px");

            }
            else{
                var newHeight = $("#imgTop img").height();
                newImgBtmTop = imgBottomPositionRatio * newHeight;
                newImgTopTop = imgTopPositionRatio * newHeight;
                $("#imgBottom img").css("top", newImgBtmTop + "px");
                $("#imgBottom .lineColIndicatorArea").css("top", newImgBtmTop + "px");
                $("#imgTop img").css("top", newImgTopTop + "px");
                $("#imgTop .lineColIndicatorArea").css("top", newImgTopTop + "px");
                $("#transcriptionCanvas").css("height",newHeight+"px");
                $(".lineColIndicatorArea").css("height",newHeight+"px");
            }
            if(minimalLines){
                $.each($(".lineColOnLine"), function(){$(this).css("line-height", ($(this).height() * 2)-15 + "px"); });
            }
            else{
                $.each($(".lineColOnLine"), function(){
                    $(this).css("line-height", $(this).height() + "px");
                });
            }
            clearTimeout(doit);
            var doit = "";
            if(liveTool !== "parsing"){
                doit = setTimeout(attachTemplateResize, 100);
            }
            textSize();
            responsiveNavigation();
        };

    }
    
    function getURLVariable(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == variable){return pair[1];}
        }
        return(false);
    }

    function replaceURLVariable(variable, value){
           var query = window.location.search.substring(1);
           var location = window.location.origin + window.location.pathname;
           var vars = query.split("&");
           var variables = "";
           for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){
                var newVar = pair[0]+"="+value;
                vars[i] = newVar;
                break;
            }
           }
           variables = vars.toString();
           variables = variables.replace(/,/g, "&");
           return(location + "?"+variables);
    }
    
    function updateURL(piece, classic){
        var toAddressBar = document.location.href;
        //If nothing is passed in, just ensure the projectID is there.
        //console.log("does URL contain projectID?        "+getURLVariable("projectID"));
        if(!getURLVariable("projectID")){
            toAddressBar = "?projectID="+projectID;
        }
        //Any other variable will need to be replaced with its new value
        if(piece === "p"){
            if(!getURLVariable("p")){
                toAddressBar += "&p=" + tpenFolios[currentFolio-1].folioNumber;
            }
            else{
                toAddressBar = replaceURLVariable("p", tpenFolios[currentFolio-1].folioNumber);
            }
            var relocator = "project.html?"+"projectID="+projectID;
            $(".editButtons").attr("href", relocator);
        }  
        
        window.history.pushState("", "T&#8209;PEN Transcription", toAddressBar);
    }
    
    /**
     * Adjusts font-size in transcription and notes fields based on size of screen.
     * Minimum is 13px and maximum is 18px.
     *
     */
    function textSize() {
        var wrapperWidth = $('#transcriptionCanvas').width();
        var textSize = Math.floor(wrapperWidth / 60),
        resize = (textSize > 18) ? 18 : textSize,
        resize = (resize < 13) ? 13 : resize;
        $(".theText,.notes,#previous span,#helpPanels ul").css("font-size",resize+"px");
    };
    
    function responsiveNavigation(severeCheck){
        if(!severeCheck && navMemory > 0 && $('.collapsed.navigation').size()){
            $('.collapsed.navigation').removeClass('collapsed severe');
            navMemory = 0;
        }
        var width = Page.width();
        var contentWidth = (function(){
            var w=0;
            $('.trimSection').each(function(){
                w+=$(this).width();
            });
            return w;
        })();
        var addClass = (severeCheck) ? "severe" : "collapsed";
        var trims = $(".trimSection:visible").length;
        if(contentWidth>width-(trims*20)){ // margin not accounted for otherwise
            // content is encroaching and will overlap
            $('.topTrim.navigation').addClass(addClass);
            navMemory = contentWidth;
            !severeCheck && responsiveNavigation(true);
        }
        var visibleButtons = $(".buttons button:visible").length + 1; //+1 for split screen 
        if(window.innerWidth < 700){
            //We could account for what buttons are visible, but this also controls the buttons to the side of the 
            //textarea in the .transcriptlet, so I think this minimum is good all around
            $('#transWorkspace .navigation').addClass(addClass);
            !severeCheck && responsiveNavigation(true);
        }
    }
    

    
    /**
 * Make sure all image tools reset to their default values.
*/
function resetImageTools(newPage){
    $("#brightnessSlider").slider("value", "100");
    $("#contrastSlider").slider("value", "100");
    if($("button[which='grayscale']").hasClass("selected")){
            toggleFilter("grayscale");
        }
    if($("button[which='invert']").hasClass("selected")){
        toggleFilter("invert");
    }
    if(!$("#showTheLines").hasClass("selected")){
        toggleLineMarkers();
    }
    if(!$("#showTheLabels").hasClass("selected")){
        toggleLineCol();
    }
    
}
    
    var Page = {
    /**
     *  Returns converted number to CSS consumable string rounded to n decimals.
     *
     *  @param num float unprocessed number representing an object dimension
     *  @param n number of decimal places to include in returned string
     *  @returns float in ##.## format (example shows n=2)
     */
    convertPercent: function(num,n){
        return Math.round(num*Math.pow(10,(n+2)))/Math.pow(10,n);
    },
    /**
     * Sloppy hack so .focus functions work in FireFox
     *
     * @param elem element to focus on
     */
    focusOn: function(elem){
        setTimeout("elem.focus()",0);
    },
    /**
     * Window dimensions.
     *
     * @return Integer width of visible page
     */
    width: function() {
        return window.innerWidth !== null? window.innerWidth: document.body !== null? document.body.clientWidth:null;
    },
    /**
     * Window dimensions.
     *
     * @return Integer height of visible page
     */
    height: function() {
        return window.innerHeight !== null? window.innerHeight: document.body !== null? document.body.clientHeight:null;
    }
};

// Shim console.log to avoid blowing up browsers without it
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };
