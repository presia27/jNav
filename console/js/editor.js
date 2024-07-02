/*

jNav Edit Console 0.0.1
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
        Last Updated: 2024-07-01

*/

// TEMPORARY index url
var navUrl = "../sample/index.json";

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
window.addEventListener("load", loadData);


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

// SAVE entries
var btSaveEntry = document.getElementById("btSaveEntry");
btSaveEntry.addEventListener("click", saveEntry);

function saveEntry() {
    var entryData = jsonifyEntry(); // CONSTRUCT NEW JSONIFIED ENTRY

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
    banner.innerHTML = "NOW EDITING \"" + headingData.title + "\"";

    changesSaved = true;
    btSaveHeading.style.backgroundColor = "green";
}

// SAVE sections
var btSaveSection = document.getElementById("btSaveSection");
btSaveSection.addEventListener("click", saveSection);

function saveSection() {
    var sectionData;
    var currentData = [];
    // **Copy current data, SPLICE DATA**
    searchById(clickedId, jsonData, null, function(result, section) {
        // **COPY ALL CURRENT DATA INTO currentData**
        for (var i = 0; i < result.content.length; i++) {
            currentData.push(result.content[i]);
        }

        sectionData = jsonifySection(currentData);

        var isRoot;
        if (section != null) {
            isRoot = false;
        } else {
            isRoot = true;
        }

        spliceIndex(clickedId, isRoot, sectionData); // SPLICE with new data
    });

     // update HTML on page to reflect SOME of the changes
     var sectionElm = document.getElementById(clickedId);
     var sectionText = sectionElm.getElementsByClassName("identText")[0];
     sectionText.innerHTML = sectionData.sectionName + " (" + sectionData.id + ")";
     
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
