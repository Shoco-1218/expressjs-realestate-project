'use strict';

  window.onload = rotate;

  // Create an array of image src for banner
  var column = document.querySelectorAll('#rowImages');
  const adImage = [];
  for(let i = 0; i < column.length; i++){
    let imageSrc = column[i].src;
    adImage.push(imageSrc);
  }

  var thisAd = 0;
  const adBanner = document.getElementById('adBanner');
  const goBtn = document.getElementById("goBtn");
  const stopBtn = document.getElementById("stopBtn");
  let timeHandle;

  function rotate(){
    if(thisAd === adImage.length){
      thisAd = 0;
    }
    adBanner.src = adImage[thisAd];
    thisAd++
    timeHandle = setTimeout(rotate, 2000);
  }

  function currentSlide(n) {
    thisAd = n-1;
    clearTimeout(timeHandle);
    timeHandle = null;
    rotate(thisAd);
  }
  function restart(){
    if(timeHandle == null){
      rotate(thisAd);
    }
  }
  function stop(){
    clearTimeout(timeHandle);
    timeHandle = null;
  }
  