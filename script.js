var audio = document.getElementById("audio");
var title = document.getElementById("title");
var progress = document.getElementById("progress");

var playlist = [

{title:"Surah Fatiha",file:"audio/fatiha.mp3"},
{title:"Ayatul Kursi",file:"audio/ayatul_kursi.mp3"},
{title:"Surah Ikhlas",file:"audio/ikhlas.mp3"},
{title:"Surah Falaq",file:"audio/falaq.mp3"},
{title:"Surah Naas",file:"audio/naas.mp3"}

];

var index = 0;

function loadTrack(){

audio.src = playlist[index].file;

title.innerText = playlist[index].title;

}

function play(){

audio.play();

}

function pause(){

audio.pause();

}

function next(){

index++;

if(index >= playlist.length){

index = 0;

}

loadTrack();

audio.play();

}

function prev(){

index--;

if(index < 0){

index = playlist.length-1;

}

loadTrack();

audio.play();

}

function selectTrack(i){

index = i;

loadTrack();

audio.play();

}

audio.addEventListener("timeupdate",function(){

if(audio.duration){

progress.value = (audio.currentTime / audio.duration)*100;

}

});

progress.addEventListener("input",function(){

audio.currentTime = (progress.value/100)*audio.duration;

});

audio.addEventListener("ended",next);

loadTrack();
