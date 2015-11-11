var watson = require('watson-developer-cloud');
var fs = require('fs');
// var express = require('express');
var path = require('path');
var exec = require('child_process').exec;

// var app = module.exports = express.createServer();

var speech_to_text = watson.speech_to_text({
  username: 'e64053b3-4c90-49fb-bdac-b4ece95b3e09',
  password: 'B4IzYVCOKtUT',
  version: 'v1'
});

var text_to_speech = watson.text_to_speech({
  username: 'd09872fc-184d-4390-ba84-7ca62e8bdc66',
  password: 'zNX8CMn2rTdZ',
  version: 'v1'
});

var sr_chat = function(inputpath, transcriptpath, outputpath) {
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
      // extract the useful messages and write them in a file 'transcription_i.txt'
      // i is the sequence number
      // console.log(typeof res['results']);
      if (res['results'][0] == undefined || res.results[0].alternatives[0].word_confidence == undefined) {
      	transcript = 'No speech!';
      	confidence = '1';
      	word_confidence = 'No speech';
      }
      else {
		// console.log(res.results[0].alternatives[0]);
	    // transcript = res.results[0].alternatives[0].transcript;
	    var confidence = res.results[0].alternatives[0].confidence;
	    var word_confidence = res.results[0].alternatives[0].word_confidence;
		console.log('word confidence', word_confidence);
      var transcript = '';
      for (var i=0; i<word_confidence.length; i++) {
        if (word_confidence[i][1] < 0.2)
          transcript = transcript + '<span class=\"error\">'+word_confidence[i][0]+"</span>" + ' ';
        else
          transcript = transcript + word_confidence[i][0] +' ';
      }
	  }

      fs.writeFile(transcriptpath, '$'+confidence+'$'+transcript,  function(err) {
        if (err) {
          return console.error(err);
        }
        // if all the information is stored
        else {
          /************ TO BE DONE ******************/
          // send the transcription file to the user

          // chat with robot
          exec('python chatwithrobot.py '+transcriptpath+' '+outputpath+'_out.txt', function(error, stdout, stderr){
            // if chat successful, then generate audio file 'output_i.wav'
            if(stdout.length>1) {
              console.log('Bot:', stdout);
              var params = {
                text: stdout,
                voice: 'en-US_MichaelVoice', // Optional voice
                accept: 'audio/wav'
              };
              // Pipe the synthesized text to a file
              text_to_speech.synthesize(params).pipe(fs.createWriteStream(outputpath+'.wav'));

              /************ TO BE DONE ******************/
              // send the audio file to user
            } 
            else {
              console.log('sorry, I can\'t reply it');
            }
            if(error) {
              console.info('stderr:'+stderr)
            }
          });
        }
      });
      
    }
  });

}


//sr_chat('./opensmile.wav', './transcript_1.txt/', './output_1.wav');
module.exports = sr_chat;





