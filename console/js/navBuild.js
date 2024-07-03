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

/*

This script builds the navigation index in the webpage. This script was built
for the jNav Console, but may be treated as sample code, referenced and adapted
to fit your needs.

*/

var nav;
var jsonurl;

function setParams(navElm, jsonUrl) {
    nav = navElm;
    jsonurl = jsonUrl;
    console.log("Data file location: " + jsonurl);
}

function loadIndex(callback) {
    retrieveRawData(jsonurl, function(status) {
        if (status == 200) {
            console.log("Index data found :: " + status + " OK");

            // Generate nav
            processIndex(jsonData, null, 0, function(status) {
                if (status == true && typeof callback == "function") {
                    callback(status); // return status = true if element index building is complete
                }
            });
        }
    });
}

function processIndex(target, sectionId, levelCounter, callback) {
    for (var i = 0; i < target.length; i++) {
        if(target[i].type == "section") {
            // **CREATE NEW SECTION**
            var sectionElm = buildSection(target[i]);

            // Deciding where to append the element
            if (levelCounter == 0 && sectionId == null) {
                nav.appendChild(sectionElm);
            } else {
                var parentSection = document.getElementById(sectionId);
                parentSection.appendChild(sectionElm);
            }

            processIndex(target[i].content, target[i].id, levelCounter + 1);
        } else if (target[i].type == "heading1" || target[i].type == "heading2") {
            // **CREATE HEADINGS**
            var headElm = buildHeading(target[i]);

            if (levelCounter == 0 && sectionId == null) {
                nav.appendChild(headElm);
            } else {
                var parentSection = document.getElementById(sectionId);
                parentSection.appendChild(headElm);
            }
        } else if (target[i].type == "entry") {
            // **CREATE ENTRIES**
            var entryElm = buildEntry(target[i]);

            if (levelCounter == 0 && sectionId == null) {
                nav.appendChild(entryElm);
            } else {
                var parentSection = document.getElementById(sectionId);
                parentSection.appendChild(entryElm);
            }
        }
    }

    if(i == target.length && levelCounter == 0) {
        console.log("Index build complete");
        if (typeof callback == "function") {
            callback(true);
        }
    }
}

function buildSection(elm) {
    var divWrap = document.createElement("div");
    var divElm = document.createElement("div");
    var sectionIdent = document.createElement("span");
    
    divWrap.setAttribute("id", elm.id);
    divWrap.classList.add("navSectionWrap");
    divWrap.classList.add("selectable");
    divElm.classList.add("navSection");
    sectionIdent.innerText = elm.sectionName + " (" + elm.id + ")";
    sectionIdent.classList.add("identText");

    divElm.appendChild(sectionIdent);
    divWrap.appendChild(divElm);

    return divWrap;
}

function buildHeading(elm) {
    var headElm;
    if (elm.type == "heading1") {
        headElm = document.createElement("h2");
        headElm.classList.add("heading1");
    } else if (elm.type == "heading2") {
        headElm = document.createElement("h3");
        headElm.classList.add("heading2");
    }

    headElm.setAttribute("id", elm.id);
    headElm.classList.add("selectable");
    headElm.innerText = elm.value;

    return headElm;
}

function buildEntry(elm) {
    var entryAnchor = document.createElement("a");
    var entryDiv = document.createElement("div");
    
    entryAnchor.setAttribute("id", elm.id);
    entryAnchor.setAttribute("title", elm.title);
    entryAnchor.classList.add("link");
    entryAnchor.classList.add("selectable");
    entryAnchor.setAttribute("href", "javascript:void(0)");

    entryDiv.classList.add("linkText");
    entryDiv.innerText = elm.title;

    // ADD STYLING
    // I don't want an error or omission to break everything.
    // Styling isn't essential, so if it's improperly formatted, styling can be skipped.
    if (elm.style.constructor === Array) {
        for (var i = 0; i < elm.style.length; i++) {
            entryDiv.classList.add(elm.style[i]);
        }
    }

    entryAnchor.appendChild(entryDiv);

    return entryAnchor;
}
