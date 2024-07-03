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
        Created: 2024-07-01
        Last Updated: 2024-07-02

*/

/*

This file contains table controls (buttons, text boxes, etc.)

*/

// Variables for table banners
var banner = document.getElementById("banner"); // Info banner
var actionBanner = document.getElementById("actionBanner"); // Banner used for alerts

// Variables for HTML tables
var entryTable = document.getElementById("entryTable"); // Editing table used for regular entries
var headingTable = document.getElementById("headingTable"); // Editing table used for headings
var sectionTable = document.getElementById("sectionTable"); // Editing table used for sections

// Variables for content fields
var entrySection = document.getElementById("entrySection");
var entryId = document.getElementById("entryId");
var entryTitle = document.getElementById("entryTitle");
var entryDescription = document.getElementById("entryDescription");
var ckBold = document.getElementById("ckBold");
var ckItal = document.getElementById("ckItal");
var ckUnder = document.getElementById("ckUnder");
var ckIndent = document.getElementById("ckIndent");
var entryType = document.getElementById("entryType");
var entryUrl = document.getElementById("entryUrl");
var entryAction = document.getElementById("entryAction");

// Variables for heading content fields
var headingSection = document.getElementById("headingSection");
var headingId = document.getElementById("headingId");
var headingValue = document.getElementById("headingValue");
var headingStyle = document.getElementById("headingStyle");

// Variables for sections
var sectionParentId = document.getElementById("sectionParentId");
var sectionId = document.getElementById("sectionId");
var sectionName = document.getElementById("sectionName");



/* ***CLEAR TABLES*** */
/* Table reset code is in editor.js */
//Index Entries
function clearEntry() {
    entryId.value = "";
    entryTitle.value = "";
    entryDescription.value = "";
    ckBold.checked = false;
    ckItal.checked = false;
    ckUnder.checked = false;
    ckIndent.checked = false;
    entryType.value = "notSet";
    entryUrl.value = "";
    entryAction.value = "notSet";
}

//Index Headings
function clearHeading() {
    headingId.value = "";
    headingValue.value = "";
    headingStyle.value = "notSet";
}

//Index Sections
function clearSection() {
    sectionId.value = "";
    sectionName.value = "";
}


/* ***LOAD TABLES*** */
//Load entry table
function loadEntryTable(elm, parentElmId) {
    // clear table
    clearEntry();
    clearHeading();
    clearSection();
    // display table
    entryTable.style.display = "table";
    headingTable.style.display = "none";
    sectionTable.style.display = "none";
    // load table
    entrySection.value = parentElmId;
    entryId.value = elm.id;
    entryTitle.value = elm.title;
    entryDescription.value = elm.description;

    // add style info
    for (var i = 0; i < elm.style.length; i++) {
        if (elm.style[i] == "bold") {
            ckBold.checked = true;
        } else if (elm.style[i] == "ital") {
            ckItal.checked = true;
        } else if (elm.style[i] == "underline") {
            ckUnder.checked = true;
        } else if (elm.style[i] == "indent") {
            ckIndent.checked = true;
        } // add else statement for other misc styling options later (put in text box)
    }

    entryType.value = elm.linkType;
    entryUrl.value = elm.url;
    entryAction.value = elm.action;

    // Activate table banners
    banner.style.backgroundColor = "rgb(153, 204, 255)";
    banner.innerHTML = "NOW EDITING \"" + elm.title + "\"";

    // Listen for changes in the table
    $("#entryTable > tbody > tr > td > input, #entryTable > tbody > tr > td > select").on("change input", function() {
        changesSaved = false;
        document.getElementById("btSaveEntry").style.backgroundColor = "orange";
    })
}

//Load heading table
function loadHeadingTable(elm, parentElmId) {
    // clear table
    clearEntry();
    clearHeading();
    clearSection();
    // display table
    entryTable.style.display = "none";
    headingTable.style.display = "table";
    sectionTable.style.display = "none";
    // load table
    headingSection.value = parentElmId;
    headingId.value = elm.id;
    headingValue.value = elm.value;
    headingStyle.value = elm.type;

    // Activate table banners
    banner.style.backgroundColor = "rgb(153, 204, 255)";
    banner.innerHTML = "NOW EDITING \"" + elm.value + "\"";

    // Listen for changes in the table
    $("#headingTable > tbody > tr > td > input, #headingTable > tbody > tr > td > select").on("change input", function() {
        changesSaved = false;
        document.getElementById("btSaveHeading").style.backgroundColor = "orange";
    })
}

//Load section table
function loadSectionTable(elm, parentElmId) {
    // clear table
    clearEntry();
    clearHeading();
    clearSection();
    // display table
    entryTable.style.display = "none";
    headingTable.style.display = "none";
    sectionTable.style.display = "table";
    // load table
    sectionParentId.value = parentElmId;
    sectionId.value = elm.id;
    sectionName.value = elm.sectionName;

    // Activate table banners
    banner.style.backgroundColor = "rgb(153, 204, 255)";
    banner.innerHTML = "NOW EDITING \"" + elm.sectionName + "\"";

    // Listen for changes in the table
    $("#sectionTable > tbody > tr > td > input, #sectionTable > tbody > tr > td > select").on("change input", function() {
        changesSaved = false;
        document.getElementById("btSaveSection").style.backgroundColor = "orange";
    })
}

/* ***BUILD INDEX ENTRIES*** */
function jsonifyEntry() {
    // parse styling
    var style = [];
    if (ckBold.checked == true) {
        style.push("bold");
    }
    if (ckItal.checked == true) {
        style.push("ital");
    }
    if (ckUnder.checked == true) {
        style.push("underline");
    }
    if (ckIndent.checked == true) {
        style.push("indent");
    }

    // RETURN ENTRY DATA JSONIFIED USING entryMod FUNCTION
    return entryMod(
        entryId.value,
        entryTitle.value,
        entryDescription.value,
        style,
        entryType.value,
        entryUrl.value,
        entryAction.value
    );
}

function jsonifyHeading() {
    return headingMod(
        headingId.value,
        headingStyle.value,
        headingValue.value
    );
}

function jsonifySection(currentData) {
    return sectionMod(
        sectionId.value,
        sectionName.value,
        currentData
    );
}
