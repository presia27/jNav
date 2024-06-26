/*

========}    J N A V    {========

    jNav Libary Beta version 0.1.1
    COPYRIGHT (C) 2024 PRESTON SIA (PRESIA27)
    THIS SOFTWARE IS LICENSED UNDER THE APACHE LICENSE, VERSION 2.0
    [https://www.apache.org/licenses/LICENSE-2.0]

*/


/*

This script contains functions used to retrieve information
from the specified JSON file. This has been adapted from
navBuilder.js in the PDFViewer project.

*/

var jsonData = ""; // holds parsed JSON data



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
