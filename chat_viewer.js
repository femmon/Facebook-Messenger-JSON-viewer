const e = React.createElement;
var myName;
var cleanedData;

const fileSelector = document.getElementById('fileupload');
fileSelector.addEventListener('change', (event) => {
  const fileList = event.target.files;
  console.log(fileList);
  readJSON(fileList[0]);
});

const domButton = document.querySelector('#submit-button');
ReactDOM.render(
  e('button', {onClick: () => handleSubmit()}, "Submit"),
  domButton
);


function handleSubmit(){
  ReactDOM.render(e(ChatArea), document.querySelector('#chat-area'))
  const domChat = document.querySelector('#chat-display');
  ReactDOM.render(e(ChatBubble), domChat);
  addChatTitle();
}

function readJSON(file) {
  const reader = new FileReader();

  reader.addEventListener('load', (event) => {
    console.log("JSON load sucessful");
    msgObject = JSON.parse(event.target.result);
    cleanedData = cleanData(msgObject);
    promptParticipantRadio(cleanedData.participants);
  });

  reader.readAsText(file);

  
}

function decode(s) {
  let d = new TextDecoder;
  let a = s.split('').map(r => r.charCodeAt());
  return d.decode(new Uint8Array(a));
}

function cleanData(raw) {
  var participants = raw.participants.map(person => person.name).map(name => {
    return decode(name)
  });
  var title = raw.title;
  var msgs = raw.messages.map(msg => {
    msg.sender_name = decode(msg.sender_name)

    if (msg.content) {
      msg.content = decode(msg.content)
    }
    if (msg.share && msg.share.share_text) {
      msg.share.share_text = decode(msg.share.share_text)
    }
    return msg
  });

  var cleaned = {
    "participants": participants,
    "title": title,
    "msgs": msgs,
  }

  return cleaned
}

function addChatTitle() {
  const chatTitle = document.querySelector('#chat-title')
  ReactDOM.render(e('h2', {}, cleanedData.title), chatTitle);
}

function promptParticipantRadio(participants){
  const participantsRadio = document.querySelector('#participants-radio');
  var radioElements = []

  radioElements.push(e('p', {}, 'Which participant are you?'))

  participants.forEach(function (n, i) {
    radioElements.push(
      e('input', {
        type: 'radio', 
        name: 'participant', 
        onClick: () => radioClick(n), 
        id: ("radio-button-" + i)
      })
    );
    radioElements.push(
      e('label', {onClick: () => document.getElementById('radio-button-' + i).click()}, n)
    );
    radioElements.push(e('br'));
  });
  ReactDOM.render(radioElements, 
                  participantsRadio);
        
  document.querySelector("#radio-button-0").click();

}

function radioClick(name) {
  myName = name;
  console.log(`Setting ${name} as blue bubble`);
}

class ChatBubble extends React.Component {
  generateBubbles(msg) {
    const photos = msg.photos && msg.photos.length > 0 ? msg.photos.map((photo, i) => (
      e('img', { src: photo.uri.startsWith('messages') ? photo.uri.slice(8) : photo.uri, style: { height: '100px' }, key: i })
    )) : null
    const content = e('p', { style: { margin: 0 } },
      msg.content + (msg.share && msg.share.link ? ': ' + msg.share.link : ''),
      msg.share && msg.share.share_text ? e('br') : null,
      msg.share && msg.share.share_text ? msg.share.share_text: null,
      msg.photos && msg.photos.length > 0 ? e('br') : null,
      photos
    )
    if (msg.sender_name == myName) {
      return (
        e(
          'div', {className: "message-container"}, 
          e('div', {className: "name-right"}, msg.sender_name),
          e('div', {className: "bubble-right"}, content),
          e('span', {className: "tooltip-right"}, timeConverter(msg.timestamp_ms))
        )
      );
    } else {
      return (
        e(
          'div', {className: "message-container"}, 
          e('div', {className: "name-left"}, msg.sender_name),
          e('div', {className: "bubble-left"}, content),
          e('span', {className: "tooltip-left"}, timeConverter(msg.timestamp_ms))
        )
      );
    }

  }
  render() {
    return (
      cleanedData.msgs.map(msg => this.generateBubbles(msg))
      )
  }
}

class ChatArea extends React.Component {
  render() {
    return (
      e('div', {id: "chat-display"}, null)
    );
      
  }
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
  var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}