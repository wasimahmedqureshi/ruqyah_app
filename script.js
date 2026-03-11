var audio=document.getElementById("audio")
var title=document.getElementById("title")
var progress=document.getElementById("progress")

var index=0
var repeatCount=0

// RUQYAH STREAMING

var ruqyahPlaylist=[

{title:"Surah Fatiha",file:"audio/fatiha.mp3"},
{title:"Ayatul Kursi",file:"audio/ayatul_kursi.mp3"},
{title:"Surah Ikhlas",file:"audio/ikhlas.mp3"},
{title:"Surah Falaq",file:"audio/falaq.mp3"},
{title:"Surah Naas",file:"audio/naas.mp3"}

]

// EVIL EYE

var evilPlaylist=[

{title:"Evil Eye Ruqyah",file:"audio/evil_eye.mp3"},
{title:"Nazar Protection",file:"audio/nazar.mp3"}

]

// FULL QURAN (Example few surah – आप 114 add कर सकते हैं)

var quranPlaylist=[

{title:"Surah Baqarah",file:"audio/baqarah.mp3"},
{title:"Surah Yaseen",file:"audio/yaseen.mp3"},
{title:"Surah Rahman",file:"audio/rahman.mp3"}

]

var playlist=ruqyahPlaylist

function loadTrack(i){

audio.src=playlist[i].file
title.innerText=playlist[i].title

}

loadTrack(index)

function playAudio(){

audio.play()

}

function pauseAudio(){

audio.pause()

}

function nextTrack(){

index++

if(index>=playlist.length){

index=0

}

repeatCount=0
loadTrack(index)
playAudio()

}

function prevTrack(){

index--

if(index<0){

index=playlist.length-1

}

repeatCount=0
loadTrack(index)
playAudio()

}

// AUTO 3 TIMES

audio.addEventListener("ended",function(){

repeatCount++

if(repeatCount<3){

audio.currentTime=0
audio.play()

}

else{

nextTrack()

}

})

// PROGRESS BAR

audio.addEventListener("timeupdate",function(){

if(audio.duration){

progress.value=(audio.currentTime/audio.duration)*100

}

})

progress.addEventListener("input",function(){

audio.currentTime=(progress.value/100)*audio.duration

})

// SECTION SWITCH

function showSection(type){

if(type=="ruqyah"){

playlist=ruqyahPlaylist

}

if(type=="evil"){

playlist=evilPlaylist

}

if(type=="quran"){

playlist=quranPlaylist

}

index=0
loadTrack(index)

}

// TASBEEH

var count=0

function increase(){

count++
document.getElementById("count").innerText=count

}

function reset(){

count=0
document.getElementById("count").innerText=count

}

// DARK MODE

function toggleDark(){

document.body.classList.toggle("dark")

}
