const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

let api_key = 'mQm5M8FKoDrr6kHa2egihXw9Y7p1XvyoEEjPdRKoyd1f'; //Bowen's
let url = 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/8332649b-5341-4b1d-acd7-d09c5dca8c97'; //Bowen's
let assistant_id = '62dfbaa1-b17c-4bfa-8693-5c3be0e12d19'; //Bowen's

/*
let api_key = 'PMDpVBUyLC7XpKV-N9hUSmvaY6cWUkEKlXtd3apcOCxh';
let url = 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/b730816f-f905-4b51-94bc-e0b83114e73d';
let assistant_id = 'ffa3c0ac-2506-402f-a3c5-a3ee89c9eb10';
*/

let session_id = "";
let bot_msg = "";
let next_question = "";
let language_val = "";
let is_Google = false;

const assistant = new AssistantV2({
    version: '2019-02-28',
    authenticator: new IamAuthenticator({
        apikey: api_key,
    }),
    url: url,
});

async function createWatsonAssistantSession(){
    try{
        const session = await assistant.createSession({
            assistantId: assistant_id
        });
        console.log(JSON.stringify(session.result, null, 2)); // for checking JSON response from Watson
        session_id = session.result.session_id.toString();
        //console.log("Session created!, session id: " + session_id);
            
        let input_message = "hello";
        console.log("Input message: " + input_message);
    
        const messege = await sendWatsonAssistantMessage(input_message);
        bot_msg = messege;  
        console.log("Initial message: " + bot_msg);
        
    }
    catch (e) {
        console.log('error', e);
        return null;
    }
}

async function sendWatsonAssistantMessage(input_message){
    try{
        const message = await assistant.message({
            assistantId: assistant_id,
            sessionId: session_id,
            input: {
                'message_type': 'text',
                'text': input_message
            }
        });
        console.log(JSON.stringify(message.result, null, 2)); // for checking JSON response from Watson
        let generic = message.result.output.generic // array of responses
        var i;
        let response = '';
        for(i = 0; i<generic.length; i++){
            response = response.concat(generic[i].text.toString() + '\n');
        } 
        next_question = response;
        console.log("Watson Assistant response: " + next_question);
        return response;
    }
    catch (e) {
        console.log('error', e);
        return null;
    }
}

async function deleteWatsonAssistnatSession(){
    try{
        await assistant.deleteSession({
            assistantId: assistant_id,
            sessionId: session_id,
        })
        console.log("Session deleted!");
        window.location.href = 'web.html';
    }
    catch (e) {
      console.log('error', e);
      return null;
    }
}

async function addChat(){
    try{
        var client_div = document.createElement('div');
        client_div.setAttribute('class','container darker');
        var client_img = document.createElement('img');
        // set attribute to client image
        client_img.setAttribute('src','human.png');
        client_img.setAttribute('alt','Avatar');
        client_img.setAttribute('class','right');
        client_div.appendChild(client_img);
        
        // set up the client_msg
        var p = document.createElement('p');
        var b = document.createElement('b');
        var input = document.getElementById('input-box').value
        var client_msg = document.createTextNode(input);
        b.appendChild(client_msg);
        p.appendChild(b);
        client_div.appendChild(p);
        var sp = document.createElement('span');
        var today = new Date();
        var timeToday = today.getHours() + ":" + today.getMinutes();
        var time = document.createTextNode(timeToday);
        sp.appendChild(time);
        sp.setAttribute('class','time-left');
        client_div.appendChild(sp);
        var current = document.getElementsByClassName('chat-scroll');
        current[0].appendChild(client_div);
        document.getElementById('input-box').value=''; // clear the input area
        
        // above deals with the chatbox for the user input
        var assistant_div = document.createElement('div');
        assistant_div.setAttribute('class','container');
        // attribute of robot image
        var assistant_img = document.createElement('img');
        assistant_img.setAttribute('src','robot.png');
        assistant_img.setAttribute('alt','Avatar');
        assistant_div.appendChild(assistant_img);

        var p = document.createElement('p');
        console.log("USER INPUT: " + input);
        if(language_val != ""){
            input = await translate(language_val + "-en", input);
            if(is_Google == true){
                input = await translate_Google(language_val, input);
            }
        } 
        next_question = await sendWatsonAssistantMessage(input);
        
        if(language_val != ""){
            next_question = await translate("en-" + language_val, next_question);
            if(is_Google == true){
                next_question = await translateText(language_val, next_question);
            }
        } 

        var objDiv = document.getElementById("autoScroll");
        objDiv.scrollTop = objDiv.scrollHeight;

        var text = document.createTextNode(next_question);
        p.appendChild(text);
        assistant_div.appendChild(p);
        var sp = document.createElement('span');
        var today = new Date();
        var timeToday = today.getHours() + ":" + today.getMinutes();
        var time = document.createTextNode(timeToday);
        sp.appendChild(time);
        sp.setAttribute('class','time-right');
        assistant_div.appendChild(sp);
        
        var current = document.getElementsByClassName('chat-scroll');
        current[0].appendChild(assistant_div); 

        var objDiv = document.getElementById("autoScroll");
        objDiv.scrollTop = objDiv.scrollHeight;    
    
        addGames();
    }
    catch (e) {
        console.log('error', e);
        return null;
    }
}

const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');

let api_key2 = 'u5CyWhz0rS5u1vsd-WjbiQ5IwOE34Tw4YxeBjDfaDMTh'; 
let url2 = 'https://api.us-south.language-translator.watson.cloud.ibm.com/instances/1f8350bc-f2bc-4a6d-a1d5-4b49845d6497'; 

const languageTranslator = new LanguageTranslatorV3({
  version: '2018-05-01',
  authenticator: new IamAuthenticator({
    apikey: api_key2,
  }),
  url: url2,
});

async function setLanguage(text){
    try{
        var input = document.getElementById('input-box').value
        identifiedLanguages = await languageTranslator.listIdentifiableLanguages();
        let languages = identifiedLanguages.result.languages;
        let lang = ""
        let name = ""
        var i;
        console.log("input = " + input);
        for(i = 0; i<languages.length; i++){
            if(input.toLowerCase() == languages[i].name.toString().toLowerCase()){
                name = languages[i].name.toString().toUpperCase();
                lang = languages[i].language.toString();
            }
        } 
        let model1 = lang + "-en";
        let model2 = "en-" + lang;
        translationModels = await languageTranslator.listModels();
        let models = translationModels.result.models;
        let available1 = false;
        let available2 = false;
        var i;
        for(i = 0; i<models.length; i++){
            if(model1 == models[i].model_id.toString()){
                available1 = true;
            }
            if(model2 == models[i].model_id.toString()){
                available2 = true;
            }
        } 
        if(available1 == true && available2 == true){
            language_val = lang;
            console.log(language_val);
            // above deals with the chatbox for the user input
            var assistant_div = document.createElement('div');
            assistant_div.setAttribute('class','container');
            // attribute of robot image
            var assistant_img = document.createElement('img');
            assistant_img.setAttribute('src','robot.png');
            assistant_img.setAttribute('alt','Avatar');
            assistant_div.appendChild(assistant_img);
    
            var p = document.createElement('p');
            let trans = await translate("en-" + lang, "Which platform do you prefer to play on?")
            var text = document.createTextNode("Language is set to " + name + " " + trans);
            p.appendChild(text);
            assistant_div.appendChild(p);
            var sp = document.createElement('span');
            var today = new Date();
            var timeToday = today.getHours() + ":" + today.getMinutes();
            var time = document.createTextNode(timeToday);
            sp.appendChild(time);
            sp.setAttribute('class','time-right');
            assistant_div.appendChild(sp);
            
            var current = document.getElementsByClassName('chat-scroll');
            current[0].appendChild(assistant_div); 
    
            var objDiv = document.getElementById("autoScroll");
            objDiv.scrollTop = objDiv.scrollHeight;  
        }else{
            // above deals with the chatbox for the user input
            var assistant_div = document.createElement('div');
            assistant_div.setAttribute('class','container');
            // attribute of robot image
            var assistant_img = document.createElement('img');
            assistant_img.setAttribute('src','robot.png');
            assistant_img.setAttribute('alt','Avatar');
            assistant_div.appendChild(assistant_img);
    
            var p = document.createElement('p');
    
            var text = document.createTextNode("Language not available, try another language or continue with English");
            p.appendChild(text);
            assistant_div.appendChild(p);
            var sp = document.createElement('span');
            var today = new Date();
            var timeToday = today.getHours() + ":" + today.getMinutes();
            var time = document.createTextNode(timeToday);
            sp.appendChild(time);
            sp.setAttribute('class','time-right');
            assistant_div.appendChild(sp);
            
            var current = document.getElementsByClassName('chat-scroll');
            current[0].appendChild(assistant_div); 
    
            var objDiv = document.getElementById("autoScroll");
            objDiv.scrollTop = objDiv.scrollHeight;   
        }
    }
    catch (e) {
        console.log('error', e);
        return null;
    }
}

async function translate(lang, text){
    try{
        const translateParams = {
          text: text,
          modelId: lang,
        };
        translationResult = await languageTranslator.translate(translateParams);
        let trans = translationResult.result.translations[0].translation.toString();
        return trans;
    }
    catch (e) {
        console.log('error', e);
        return null;
    }
}

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;

const projectId = 'translate-1583364768180';
// Instantiates a client
const translate_Google = new Translate({projectId});

async function translateText(lang, text) {

  try {
    // Translates some text into Russian
    const [translation] = await translate_Google.translate(text, lang);
    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation}`);
  } catch (error) {
    console.error(error.details);
  }
}


const giantbomb = require('giantbomb');
const gb = giantbomb('9412c1963be4f5697f6ffc0013f5140a53a73a33');
async function addGames() {
    try {
        // Display details for Mass Effect.
        gb.games.get(16909, (err, res, json) => {
          console.log(json.results);
        });
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
    } catch (error) {
      console.error(error.details);
    }
}


module.exports = {addGames:addGames, translateText:translateText, setLanguage: setLanguage, translate:translate, addChat: addChat,  
    startSession: createWatsonAssistantSession, sendMessage: sendWatsonAssistantMessage, endSession: deleteWatsonAssistnatSession};
