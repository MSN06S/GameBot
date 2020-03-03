var platformId = '[48,49,6,130]'
var genresId = '(11,12,13,14,15,31)'

function addGames(){
    var request = require('request');
    //need check respose from assistant to determine which platform

    var platformId = '(48,49,6,130)';// id for all platforms ps xbob pc switch

    var options = {
      'method': 'POST',
      'url': 'https://api-v3.igdb.com/games',
      'headers': {
        'user-key': '90afd0d7f337b9deafb7e15d5dfa3f62',
        'Content-Type': 'text/plain'
      },
      body: "fields name,popularity,category,platforms,genres;\nwhere category = 0 & platforms = "+platformId+"& genres = "+genresId+" ;sort popularity desc; limit 6;\n"

    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      //console.log(response.body);
      var data = JSON.parse(response.body);
      console.log(data)
      console.log(data.length);
      console.log(data[0].name)

      //remove before picture
      var element = document.getElementById("recommendList");
      element.innerHTML = '';
      //add game list
      var i = 0;
      for (i=0;i<data.length;i++){
        var node = document.createElement("LI");
        var textnode = document.createTextNode(data[i].name);
        node.appendChild(textnode);
      }
    });

}
