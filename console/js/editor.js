/*

        jNav Edit Console 1.0.0
        COPYRIGHT (C) 2024 PRESTON SIA (PRESIA27)
        THIS SOFTWARE IS LICENSED UNDER THE APACHE LICENSE, VERSION 2.0
        [https://www.apache.org/licenses/LICENSE-2.0]

        This project utilizes:
            jQuery 3.5.1, licensed under the MIT license
            and Copyright JS Foundation and other contributors.
            [https://jquery.com/]
            [https://jquery.org/license]

            jQuery UI v 1.11.4, under the MIT license and
            Copyright 2015 jQuery Foundation and other contributors
            [http://jqueryui.com]

        Author: Preston Sia
        Created: 2024-06-30
        Last Updated: 2024-07-02

*/

// TEMPORARY index url - for testing only, refer to preferences.json for current location
//var navUrl = "../sample/index.json";
var navUrl = "";
var navFileName = "navigation.txt"; // default value, changed if specified in preferences.json

// Set variables for page elements
var nav = document.getElementById("navTree1"); // Index navigation
var banner = document.getElementById("banner"); // Info banner
var actionBanner = document.getElementById("actionBanner"); // Banner used for alerts
var entryTable = document.getElementById("entryTable"); // Editing table used for regular entries
var headingTable = document.getElementById("headingTable"); // Editing table used for headings
var sectionTable = document.getElementById("sectionTable"); // Editing table used for sections

// Status variables
var clickedId;
var changesSaved = true;

/*===========================================================*/

// ***LOAD PREFERENCES - PREFLIGHT CHECK***
function preflight() {
    var prefUrl = "preferences.json";
    var prefData;

    var prefRequest = new XMLHttpRequest();
    prefRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            prefData = JSON.parse(this.responseText);

            // SET PREFERENCES
            navUrl = prefData.jsonUrl;
            // get url params
            var urlSubstring = window.location.search.substring(1); 
            var urlParams = urlSubstring.split("&");
            for (var x = 0; x < urlParams.length; x++) { // determine whether to load template or not
                if (urlParams[x] == "newDoc=true") {
                    navUrl = prefData.templateUrl; // use template url instead of default json url
                }
            }
            
            navFileName = prefData.defaultFileName;
            // change filename in generate file dialog
            for (var i = 0; i < document.getElementsByClassName("jsonName").length; i++) {
                document.getElementsByClassName("jsonName")[i].innerHTML = navFileName;
            }
            // enable form submission in Generate File dialog
            if (prefData.formProcessor != "null" && prefData.formProcessor != undefined && prefData.formProcessor != "") {
                document.getElementById("submitCodeForm").setAttribute("action", prefData.formProcessor);
                document.getElementById("btUploadCode").style.display = "initial";
            }

            // NEXT STEPS - BUILD INDEX
            loadData();
        }
    };

    prefRequest.open("GET", prefUrl, true);
    prefRequest.setRequestHeader("Cache-Control", "no-cache, must-revalidate"); // Prevent the browser from caching the file
    prefRequest.send();
}

// ***BUILD INDEX (SET THINGS IN MOTION)***
function loadData() {
    setParams(nav, navUrl);
    loadIndex(function(status) {
        // execute next functions
        if (status == true) {
            postParser();
        }
    });
}


/*===========================================================*/


/* ***All functions needed for the post-parser routine*** */
// Get parent and next elements
function getParentElm(dragId) {
    var parentSectionId = document.getElementById(dragId).parentElement.getAttribute("id");

    return parentSectionId;
}

function getNextElm(dragId) {
    var nextElm;
    var parentElm = document.getElementById(getParentElm(dragId));

    // loop until the element is found, then increment and test
    var i;
    
    for (i = 0; i < parentElm.children.length; i++) {
        if (parentElm.children[i].getAttribute("id") == dragId) {
            // Check if the selected element is the last in the section
            if ((i + 1) >= parentElm.children.length) {
                nextElm = null;
            } else {
                nextElm = parentElm.children[i + 1].id;
            }
        }
    }

    return nextElm;
}

// Deselect highlight function
function deselect() {
    for (var i = 0; i < nav.getElementsByClassName("selectable").length; i++) {
        nav.getElementsByClassName("selectable")[i].classList.remove("active");
    }
}

// Table Load Function
function tableLoader(id) {
    if (id != "" && id != null && id != undefined) {
        searchById(id, jsonData, null, function(result, parentElmId) {
            if (result.type == "entry") {
                loadEntryTable(result, parentElmId); // table.js
            } else if (result.type == "heading1" || result.type == "heading2") {
                loadHeadingTable(result, parentElmId); // table.js
            } else if (result.type == "section") {
                loadSectionTable(result, parentElmId); // table.js
            }
        });
    }
}

// Table Reset Runction
function tableReset() {
    // RESET TABLE
    tableLoader(clickedId);

    changesSaved = true;
    document.getElementById("btSaveEntry").style.backgroundColor = "green";
    document.getElementById("btSaveHeading").style.backgroundColor = "green";
    document.getElementById("btSaveSection").style.backgroundColor = "green";
}

// ***ENABLE SELECT/HIGHLIGHT, TRACK CHANGES (SAVED VS UNSAVED), LOAD DATA INTO EDIT TABLES***
function trackChange() {
    var elm;

    if (changesSaved == true) {
        // SPECIAL INSTRUCTIONS IF A SECTION IS SELECTED
        if (this.classList.contains("identText")) {
            elm = this.parentElement.parentElement;
        } else {
            elm = this;
        }

        if (clickedId != elm.getAttribute("id")) {
            clickedId = elm.getAttribute("id");
        }

        deselect();

        elm.classList.add("active"); // ENABLE ACTIVE STYLING

        tableLoader(elm.getAttribute("id")); // load table using function above

    } else { // IF THERE ARE UNSAVED/UNCOMMITTED CHANGES
        var confirmDiscard = confirm("There are uncommitted changes. Are you sure you want to proceed?");
        if (confirmDiscard == false) {
            return false;
        } else if (confirmDiscard == true) { // clickedId does not change unless changesSaved is true initially
            setTimeout(function() {
                tableReset(); // RESET TABLE
            }, 500);
        }
    }
}


/* POST-PARSER - MAKE EVERYTHING DRAGGABLE AND HIGHLIGHTABLE; KEEP TRACK OF CLICKED ELEMENTS */
function postParser() {

    // ***Make each section sortable/draggable***
    var dragId; // ID of the dragged item
    var parentSectionId; // ID of the parent section
    var nextElmId; // items are sorted based on whatever is below it

    var nodeCopy = []; // COPY of the JSON object being moved

    $(function () {
        $("#navTree1").sortable(
            {
                items: ".selectable",
                axis: "y",
                update: function(event, ui) { // Update tables and info (ui.item refers to the clicked object)
                    dragId = ui.item[0].id;
                    parentSectionId = getParentElm(dragId);
                    nextElmId = getNextElm(dragId);

                    // set parentSectionId to null if the parent node is the root nav menu
                    // moved down here to prevent getNextElm() from breaking when searching for the parent element, in case it's the root
                    if (parentSectionId == nav.getAttribute("id")) {
                        parentSectionId = null;
                    }

                    // re-map item (delete, then add in new location)
                    searchById(dragId, jsonData, null, function(result, section) { // get actual object from jsonData
                        var isRoot;
                        nodeCopy.push(result);

                        if (section != null) {
                            isRoot = false;
                        } else {
                            isRoot = true;
                        }

                        deleteFromIndex(dragId, isRoot); // DELETE FROM INDEX
                        addToIndex(nodeCopy[0], parentSectionId, nextElmId);
                        nodeCopy.pop();
                    });

                }
            }
        );
    });


    // ***Make entries selectable***
    var selectableElms = nav.getElementsByClassName("selectable");
    for (var i = 0; i < selectableElms.length; i++) {
        if (selectableElms[i].classList.contains("navSectionWrap") || selectableElms[i].classList.contains("navSection")) { // SPECIAL INSTRUCTIONS IF IT'S A SECTION
            selectableElms[i].getElementsByClassName("identText")[0].addEventListener("click", trackChange);
        } else {
            selectableElms[i].addEventListener("click", trackChange);
        }
    }


}

// Call function on page load
window.addEventListener("load", preflight);


/* ========================================================== */

// TABLE ACTION BUTTONS (***Clear and Reset***)
var btClearEntry = document.getElementById("btClearEntry");
btClearEntry.addEventListener("click", clearEntry); // in table.js document

var btClearHeading = document.getElementById("btClearHeading");
btClearHeading.addEventListener("click", clearHeading); // in table.js document

var btClearSection = document.getElementById("btClearSection");
btClearSection.addEventListener("click", clearSection); // in table.js document

var btResetEntry = document.getElementById("btResetEntry");
var btResetHeading = document.getElementById("btResetHeading");
var btResetSection = document.getElementById("btResetSection");
btResetEntry.addEventListener("click", tableReset);
btResetHeading.addEventListener("click", tableReset);
btResetSection.addEventListener("click", tableReset);


/* ***SAVE AND DELETE*** */
// ID CHECK
function idCheck(testId) {
    var isOk;
    
    // CHECK FOR UNIQUENESS
    searchById(testId, jsonData, null, function(result, section) { // callback only runs if one was found
        // Display Action Banner
        actionBanner.innerHTML = "ERROR: ID ALREAY TAKEN";
        actionBanner.style.display = "block";
        actionBanner.style.backgroundColor = "red";
        actionBanner.style.color = "white";
        setTimeout(function() {actionBanner.style.display = "none"}, 3000);

        isOk = false;
    });

    // CHECK FOR BAD CHARACTERS
    var allowedChars = /[^A-Za-z0-9_-]/g;
    if (allowedChars.test(testId) == true) {
        actionBanner.innerHTML = "ERROR: INVALID CHARACTER - USE ONLY [A-Z], [a-z], [0-9], and \"-\" or \"-\"";
        actionBanner.style.display = "block";
        actionBanner.style.backgroundColor = "red";
        actionBanner.style.color = "white";
        setTimeout(function() {actionBanner.style.display = "none"}, 3000);

        isOk = false;
    }

    if (isOk == false) {
        return false;
    } else {
        return true;
    }
}

// SAVE entries
var btSaveEntry = document.getElementById("btSaveEntry");
btSaveEntry.addEventListener("click", saveEntry);

function saveEntry() {
    var entryData = jsonifyEntry(); // CONSTRUCT NEW JSONIFIED ENTRY

    // ID CHECK
    if (entryData.id != clickedId) { // run if ID was changed
        var isOkay = idCheck(entryData.id);
        if (isOkay == false) {
            return false; // if not unique, stop execution of function
        }
    }

    // **SPLICE NEW DATA INTO CURRENT LOCATION**
    searchById(clickedId, jsonData, null, function(result, section) { // get actual object from jsonData
        var isRoot;
        if (section != null) {
            isRoot = false;
        } else {
            isRoot = true;
        }

        spliceIndex(clickedId, isRoot, entryData); // SPLICE with new data
    });

    // update HTML on page to reflect SOME of the changes
    var anchorElm = document.getElementById(clickedId);
    var textElm = anchorElm.getElementsByClassName("linkText")[0];

    textElm.innerHTML = entryData.title;
    anchorElm.setAttribute("title", entryData.title);

    textElm.className = "linkText"; // RESET class list
    for (var i = 0; i < entryData.style.length; i++) { // Re-add classes to class list
        textElm.classList.add(entryData.style[i]);
    }
    anchorElm.style.borderTop = "1px solid #ff5c1f"; // ADD indicator that the element was changed
    anchorElm.style.borderBottom = "1px solid #ff5c1f"; // ADD indicator that the element was changed

    // **UPDATE IDs (clickedId, anchorElm id)**
    if (clickedId != entryData.id) {
        clickedId = entryData.id;
    }

    anchorElm.setAttribute("id", entryData.id); // SET ID ON HTML ELEMENT


    // update banner
    banner.innerHTML = "NOW EDITING \"" + entryData.title + "\"";

    changesSaved = true;
    btSaveEntry.style.backgroundColor = "green";
}

// SAVE headings
var btSaveHeading = document.getElementById("btSaveHeading");
btSaveHeading.addEventListener("click", saveHeading);

function saveHeading() {
    var headingData = jsonifyHeading();

    // ID CHECK
    if (headingData.id != clickedId) { // run if ID was changed
        var isOkay = idCheck(headingData.id);
        if (isOkay == false) {
            return false; // if not unique, stop execution of function
        }
    }

    // **SPLICE NEW DATA INTO CURRENT LOCATION**
    searchById(clickedId, jsonData, null, function(result, section) { // get actual object from jsonData
        var isRoot;
        if (section != null) {
            isRoot = false;
        } else {
            isRoot = true;
        }

        spliceIndex(clickedId, isRoot, headingData); // SPLICE with new data
    });

    // update HTML on page to reflect SOME of the changes
    var headElm = document.getElementById(clickedId);
    headElm.innerHTML = headingData.value;
    // RESET class list
    headElm.classList.remove("heading1", "heading2", "heading3", "heading4"); // remove existing heading types
    headElm.classList.add(headingData.type); // add current heading type
    headElm.style.color = "#ff5c1f"; // ADD indicator that the element was changed

    // **UPDATE IDs (clickedId, anchorElm id)**
    if (clickedId != headingData.id) {
        clickedId = headingData.id;
    }

    headElm.setAttribute("id", headingData.id); // SET ID ON HTML ELEMENT

    // update banner
    banner.innerHTML = "NOW EDITING \"" + headingData.value + "\"";

    changesSaved = true;
    btSaveHeading.style.backgroundColor = "green";
}

// SAVE sections
var btSaveSection = document.getElementById("btSaveSection");
btSaveSection.addEventListener("click", saveSection);

function saveSection() {
    var sectionData;
    var currentData = [];
    var idIsOkay;
    // **Copy current data, SPLICE DATA**
    searchById(clickedId, jsonData, null, function(result, section) {
        // **COPY ALL CURRENT DATA INTO currentData**
        for (var i = 0; i < result.content.length; i++) {
            currentData.push(result.content[i]);
        }

        sectionData = jsonifySection(currentData);

        // ID CHECK
        if (sectionData.id != clickedId) { // run if ID was changed
            var isOkay = idCheck(sectionData.id);
            idIsOkay = isOkay; // need to re-evaluate outside of this callback
            if (isOkay == false) {
                return false; // if not unique, stop execution of function
            }
        }

        var isRoot;
        if (section != null) {
            isRoot = false;
        } else {
            isRoot = true;
        }

        spliceIndex(clickedId, isRoot, sectionData); // SPLICE with new data
    });

    if (idIsOkay == false) {
        return false; // stop execution
    }

    // update HTML on page to reflect SOME of the changes
    var sectionElm = document.getElementById(clickedId);
    var sectionText = sectionElm.getElementsByClassName("identText")[0];
    sectionText.innerHTML = sectionData.sectionName + " (" + sectionData.id + ")";

    // add change indicator
    sectionElm.style.borderLeft = "3px solid #ff5c1f";
     
    // **UPDATE IDs (clickedId, anchorElm id)**
    if (clickedId != sectionData.id) {
        clickedId = sectionData.id;
    }

    sectionElm.setAttribute("id", sectionData.id);

    // update banner
    banner.innerHTML = "NOW EDITING \"" + sectionData.sectionName + "\"";

    changesSaved = true;
    btSaveSection.style.backgroundColor = "green";
}

/* ***DELETE FUNCTION*** */

function deleteTool() {
    var deletedType;
    var deletedName;
    
    searchById(clickedId, jsonData, null, function(result, section) {
        deletedType = result.type;

        if (deletedType == "entry") {
            deletedName = result.title;
        } else if (deletedType == "heading1" || deletedType == "heading2" || deletedType == "heading3" || deletedType == "heading4") {
            deletedName = result.value;
        } else if (deletedType == "section") {
            deletedName = result.sectionName;
        }

        var isRoot;
        if (section != null) { // determine if the element is a root element, for the delete function
            isRoot = false;
        } else {
            isRoot = true;
        }

        // First, confirm whether the user actually wants to delete the element
        var confirmDelete = confirm("Are you sure you want to delete \"" + deletedName +"\"?");
        if (confirmDelete == false) {
            return false;
        } else if (confirmDelete == true) {
            deleteFromIndex(result.id, isRoot); // DELETE ELEMENT

            // Display Action Banner
            actionBanner.innerHTML = "Deleted \"" + deletedName + "\"";
            actionBanner.style.display = "block";
            actionBanner.style.backgroundColor = "#64ff96";

            // Remove from interface
            var elmRemove = document.getElementById(clickedId);
            elmRemove.parentElement.removeChild(elmRemove); // DELETE FROM INTERFACE

            // call function to clear entry table
            if (deletedType == "entry") {
                clearEntry();
            } else if (deletedType == "heading1" || deletedType == "heading2" || deletedType == "heading3" || deletedType == "heading4") {
                clearHeading();
            } else if (deletedType == "section") {
                clearSection();
            }

            entryTable.style.display = "none";
            headingTable.style.display = "none";
            sectionTable.style.display =  "none";
            banner.style.backgroundColor = "white";
            banner.innerHTML = "SELECT A TASK OR INDEX ENTRY TO BEGIN";

            clickedId = undefined;

            setTimeout(function() {actionBanner.style.display = "none"}, 3000);
        }
    });
}

// DELETE entries
var btDeleteEntry = document.getElementById("btDeleteEntry");
btDeleteEntry.addEventListener("click", deleteTool);

// DELETE headings
var btDeleteHeading = document.getElementById("btDeleteHeading");
btDeleteHeading.addEventListener("click", deleteTool);

// DELETE sections
var btDeleteSection = document.getElementById("btDeleteSection");
btDeleteSection.addEventListener("click", deleteTool);


// ***ADD TO INDEX***
// Determine where to put it, depending on what is selected
function findInsertPoint(callabck) {
    var sectionId;
    var sitAbove;
    if (clickedId == "" || clickedId == undefined || clickedId == null) { // if nothing is selected, place at bottom
        sectionId = null;
        sitAbove = null;
    } else {
        searchById(clickedId, jsonData, null, function(result, section) {
            if (result.type == "section") { // if a section is selected, place at bottom of section
                sectionId = result.id;
                sitAbove = null;
            } else { // place at the bottom of section containing the selected element
                sectionId = section;
                sitAbove = null;
            }
        });
    }
    callabck(sectionId, sitAbove); // send variables to callback function
}

// Add new entry
function addNewEntry() {
    findInsertPoint(function(sectionId, sitAbove) { // determine where to place first
        // generate data
        var newId = "entry" + randomId();
        var addData = entryMod(newId, "New Entry", "", [], "notSet", "", "notSet");
        addToIndex(addData, sectionId, sitAbove); // ADD
        searchById(newId, jsonData, null, function(result, section) { // Get the recently created entry
            var newNode = buildEntry(result);
            var parentElm;
            if (section == null) {
                parentElm = nav;
            } else {
                parentElm = document.getElementById(section);
            }
            
            newNode.addEventListener("click", trackChange);
            parentElm.appendChild(newNode);
        });
    });
}

// Add new heading
function addNewHeading() {
    findInsertPoint(function(sectionId, sitAbove) {
        var newId = "heading" + randomId();
        var addData = headingMod(newId, "heading1", "New Heading");
        addToIndex(addData, sectionId, sitAbove); // ADD
        searchById(newId, jsonData, null, function(result, section) {
            var newNode = buildHeading(result);
            var parentElm;
            if (section == null) {
                parentElm = nav;
            } else {
                parentElm = document.getElementById(section);
            }
            
            newNode.addEventListener("click", trackChange);
            parentElm.appendChild(newNode);
        });
    });
}

// Add new section
function addNewSection() {
    findInsertPoint(function(sectionId, sitAbove) {
        var newId = "section" + randomId();
        var addData = sectionMod(newId, newId, null);
        addToIndex(addData, sectionId, sitAbove);
        searchById(newId, jsonData, null, function(result, section) {
            var newNode = buildSection(result);
            var parentElm;
            if (section == null) {
                parentElm = nav;
            } else {
                parentElm = document.getElementById(section);
            }

            newNode.getElementsByClassName("identText")[0].addEventListener("click", trackChange);
            parentElm.appendChild(newNode);
        });
    })
}


// **CONTROL BUTTONS**

var btnAddNewEntry = document.getElementById("addNewEntry");
var btnAddNewHeading = document.getElementById("addNewHeading");
var btnAddNewSection = document.getElementById("addNewSection");
var btnConvertEmbedCode = document.getElementById("convertEmbedCode");
var btnReturnHome = document.getElementById("returnHome");
var btnGenerateFile = document.getElementById("generateFile");

btnAddNewEntry.addEventListener("click", addNewEntry);
btnAddNewHeading.addEventListener("click", addNewHeading);
btnAddNewSection.addEventListener("click", addNewSection);

// Open embed code converter
btnConvertEmbedCode.addEventListener("click", function() {
    window.open("tools/embedCode.html", "_blank", "width=800 height=600");
});

btnReturnHome.addEventListener("click", function() {
    window.location = "index.html";
});

/* ****DOWNLOAD BOX**** */
var btnGenerateFile = document.getElementById("generateFile");
btnGenerateFile.addEventListener("click", generateFile);


function generateFile() {
    // Record date and time
    var currentDate = new Date();
    jsonData[0].lastModified = currentDate.toISOString();

    var textPackage = JSON.stringify(jsonData);
    var b64string = window.btoa(textPackage); // convert to base64

    var downloadBoxWrapper = document.getElementById("downloadBoxWrapper");
    var codeSpace = document.getElementById("codeSpace")
    var downloadLink = document.getElementById("downloadLink");
    var btnCloseDownload = document.getElementById("closeDownload");

    downloadLink.setAttribute("download", navFileName); //FIXME - temporary file name
    downloadLink.setAttribute("href", "data:application/octet-stream;charset=utf-8;base64," + b64string);
    codeSpace.value = atob(b64string);

    downloadBoxWrapper.style.display = "block"; // show download box
    // Reset box on close
    btnCloseDownload.addEventListener("click", function() {
        downloadLink.setAttribute("download", "");
        downloadLink.setAttribute("href", "");
        codeSpace.value = "";
        downloadBoxWrapper.style.display = "none";
    });
}
