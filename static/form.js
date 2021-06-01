'use strict';

const name = document.getElementById('name');
const mobile = document.getElementById('mobile');
const email = document.getElementById('email');
const bedroom = document.getElementById('bedrooms');

function validation(){
  var nameValue = name.value.trim();
  var mobileValue = mobile.value.trim();
  var emailValue = email.value.trim();
  var bedValue = bedroom.value.trim();

  var valid = true;

  if(nameValue.length < 5){
    setErrorFor(name, 'Please Enter with the valid name');
    valid = false;
  }else{
    setSuccessFor(name);
  }
  if(mobileValue.length < 10){
    setErrorFor(mobile, 'Please Enter with the valid mobile number');
    valid = false;
  }else{
    setSuccessFor(mobile);
  }
  if(emailValue.indexOf("@") == -1 || emailValue.length < 5){
    setErrorFor(email, 'Please Enter with the valid email');
    valid = false;
  }else{
    setSuccessFor(email);
  }
  if(bedValue == 0){
    setErrorFor(bedroom,"Please select prefference of bedrooms.");
    valid = false;
  }else{
    setSuccessFor(bedroom);
  }
  valid ? alert('Thank you so much for your information') : false;
};

function setErrorFor(input, message){
  const formControl = input.parentElement;
  const small = formControl.querySelector('small');
  small.innerHTML = message;
  formControl.className = 'forms error';
  return false;
};

function setSuccessFor(input){
  const formControl = input.parentElement;
  formControl.className = 'forms success';
};
