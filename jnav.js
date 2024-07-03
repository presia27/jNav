/*

========}    J N A V    {========

    jNav Libary version 1.0.0
    COPYRIGHT (C) 2024 PRESTON SIA (PRESIA27)
    THIS SOFTWARE IS LICENSED UNDER THE APACHE LICENSE, VERSION 2.0
    [https://www.apache.org/licenses/LICENSE-2.0]

    Author: Preston Sia
    Created: 2024-06-25
    Last Updated: 2024-07-02

*/


/*

This script contains functions used to retrieve information
from the specified JSON file. This has been adapted from
navBuilder.js in the PDFViewer project.

*/

var jsonData = []; // holds parsed JSON data
/* The format looks something like this:

    [
        {
            "type": "section",
            "id": "Sample_Section",
            "sectionName": "Sample Section",
            "content": [

                {
                    "type": "heading1",
                    "id": "sampleHead1",
                    "value": "Sample Heading"
                },
                {
                    "type": "heading2",
                    "id": "sampleHead2",
                    "value": "Sample Heading"
                },
                {
                    "type": "entry",
                    "id": "exampleEntry",
                    "title": "Title name",
                    "description": "Short description",
                    "style": [],
                    "linkType": "",
                    "url": "",
                    "action": ""
                }

            ]
        }
    ]

*/


/*

retrieveRawData(rul, dataCallback) is used to get data from the JSON file.
The invoking script must pass the *url* of the JSON file
and a callback function script to *dataCallback*. A callback
can be used to execute other functions sequentially, ensuring
that the JSON data is loaded before anything else loads.

*/
function retrieveRawData(url, dataCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            jsonData = JSON.parse(this.responseText);
            // Callback
            if (typeof dataCallback === "function") {
                dataCallback(this.status);
            }
        }
    };

    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Cache-Control", "no-cache, must-revalidate"); // Prevent the browser from caching the file
    xhttp.send();
}


/* ***Implement functions: addToIndex, deleteFromIndex, , searchByIndex*** */
// note to self - search and getIndex tools may require recursion for nested sections


// searchById(id, target, indexCallback) returns the element by searching with a unique id
// id is the item ID, target is the target data variable (e.g. jsonData[2])
// when invoking, set sectionId to null
// IF the section is NOT found, the callback function DOES NOT run and nothing happens.
function searchById(id, target, sectionId, searchCallBack) {
    for (var i = 0; i < target.length; i++) {
        if (target[i].id == id && typeof searchCallBack === "function") { // if the element in question is found
            searchCallBack(target[i], sectionId);
        }
        else if (target[i].type == "section" && target[i].id != id) { // if the code runs into a section, use recursion to search the section
            searchById(id, target[i].content, target[i].id, searchCallBack);
        }
    }
}

/* 

Add Section
 * addData - JSON data to be added
 * sectionId - ID of section that the object will be nested under (null for no section)
 * sitAbove - the new code block will "sit above" the code block with the ID
              specified for this parameter (null for bottom of section)

*/
function addToIndex(addData, sectionId, sitAbove) {
    /* **ID CHECK** */
    searchById(addData.id, jsonData, null, function(result, section) { // if anything comes back throw error. If the ID is unique, callback function will never run (see above).
        throw new Error("ID is not unique!");
    });

    if (sectionId != null) { // if the user wants the new block WITHIN a section

        searchById(sectionId, jsonData, null, function(result, section) { // get section

            if (sitAbove != null) { // if the user does not want the element at the bottom
                var indexSitAbove = null; // index number of the element to place above
                for (var i = 0; i < result.content.length; i++) {
                    if (result.content[i].id == sitAbove) {
                        indexSitAbove = i;
                        break;
                    }
                }

                // Add the data
                if (indexSitAbove != null) { // if the sitAbove element wasn't found, DO NOT ADD
                    result.content.splice(indexSitAbove, 0, addData); //(starting index, delete count, what to add)
                }
            } else {
                result.content.push(addData); // add to bottom
            }

        });
    } else if (sitAbove != null) { // will add to root (if no matching element exists within the root, it will not be added)
        var indexSitAbove = null;
        for (var i = 0; i < jsonData.length; i++) {
            if (jsonData[i].id == sitAbove) {
                indexSitAbove = i;
                break
            }
        }

        if (indexSitAbove != null) {
            jsonData.splice(indexSitAbove, 0, addData);
        }
    } else if (sectionId === null && sitAbove === null) {
        jsonData.push(addData);
    }
}

/* 

Splice/Delete Section
set isRoot to true if deleting top level/root index entries (usually whole sections)
replaceData used to splice in new data; omit (set to null) to simply delete

*/

function spliceIndex(elementId, isRoot, replaceData) {
    if (isRoot) {
        var indexNum;
        for (var i = 0; i < jsonData.length; i++) {
            if (jsonData[i].id == elementId) {
                indexNum = i;
                break;
            }
        }

        jsonData.splice(indexNum, 1);
        if (replaceData != null) {
            jsonData.splice(indexNum, 0, replaceData);
        }
    } else {
        searchById(elementId, jsonData, null, function(result1, section1) {
            searchById(section1, jsonData, null, function(result2, section2) {
                var indexNum;
                for (var i = 0; i < result2.content.length; i++) {
                    if (result2.content[i].id == elementId) {
                        indexNum = i;
                        break;
                    }
                }

                result2.content.splice(indexNum, 1); // (index#, deleteCount)
                if (replaceData != null) {
                    result2.content.splice(indexNum, 0, replaceData);
                }
            });
        });
    }
}

function deleteFromIndex(elementId, isRoot) {
    spliceIndex(elementId, isRoot, null);
}



/* ******CREATING ELEMENTS****** */
function sectionMod(id, name, contents) {
    var builder = {};

    builder.type = "section";
    builder.id = id;
    builder.sectionName = name;
    if (contents == null || contents == undefined || contents == "") {
        builder.content = [];
    } else {
        builder.content = contents;
    }

    return builder;
}

function headingMod(id, headType, value) {
    if (headType != "heading1" && headType != "heading2" && headType != "heading3" && headType != "heading4") {
        throw new Error("Invalid Heading Type");
    }


    var builder = {};

    builder.type = headType;
    builder.id = id;
    builder.value = value;

    return builder;
}

function entryMod(id, title, description, style, linkType, url, action) {    
    var builder = {};

    builder.type = "entry";
    builder.id = id;
    builder.title = title;
    builder.description = description;
    builder.style = style;
    builder.linkType = linkType;
    builder.url = url;
    builder.action = action;

    return builder;
}

function randomId() { // create a random 8-digit id
    var idGen = Math.floor(Math.random() * 100000000);
    var isUnique = true;
    searchById(idGen, jsonData, null, function(result, section) { // check if ID is taken (it shouldn't, but just in case)
        if (result.id == idGen) {
            isUnique = false;
        }
    });

    if(isUnique == true) {
        return idGen;
    } else {
        return randomId(); // try again if it's not unique
    }
}
