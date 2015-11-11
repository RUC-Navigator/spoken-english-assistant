var watson = require('watson-developer-cloud');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var speech_to_text = watson.speech_to_text({
  username: 'e64053b3-4c90-49fb-bdac-b4ece95b3e09',
  password: 'B4IzYVCOKtUT',
  version: 'v1'
});

var worderror = function(inputpath, outputpath, script) {
  script_tokens = script.toLowerCase().split(' ');
  tokens_confidence = new Array(script_tokens.length);
  for (var i=0; i<tokens_confidence.length; i++)
    tokens_confidence[i] = 0;

  var params = {
    // From file
    audio: fs.createReadStream(inputpath),
    content_type: 'audio/wav',
    word_confidence: true,
    inactivity_timeout: 60
  };

  // asynchronous recognization, so we have to write the result in a file
  speech_to_text.recognize(params, function(err, res) {
    if (err)
      console.log('can\'t recognize error', err);
    // if the wave is correctly recognized
    else {
      // console.log(typeof res['results']);
      if (res['results'][0] == undefined || res.results[0].alternatives[0].word_confidence == undefined) {
      	confidence = '1';
      	word_confidence = '';
      }
      else {
	    var confidence = res.results[0].alternatives[0].confidence;
	    var word_confidence = res.results[0].alternatives[0].word_confidence;
      var word_url = 'http://cn.bing.com/dict/dict?q='
		  console.log('word confidence', word_confidence);

      
      for (var i=0; i<word_confidence.length; i++) {
        word_confidence[i][0] = word_confidence[i][0].toLowerCase();
        console.log(script, word_confidence[i][0], script.indexOf(word_confidence[i][0]));
        for (var j=0; j<script_tokens.length; j++) {
          if (word_confidence[i][0] == script_tokens[j])
            tokens_confidence[j] = word_confidence[i][1];
        }
      }
      var transcript = '';
      for (var i=0; i<tokens_confidence.length; i++) {
        if (tokens_confidence[i] < 0.2)
          transcript = transcript + script_tokens[i]+','+word_url+script_tokens[i]+','
      }
	  }

      fs.writeFile(outputpath, transcript);
      
    }
  });

}

module.exports = worderror;





