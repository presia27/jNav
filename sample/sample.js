
window.onload = function() {
    retrieveRawData("index.json", function(status) {
        if (status == 200) {
            console.log("Index data found :: " + status + " OK");
        }
    })
}
