<!-- src/views/UidDisplay.vue -->
<template>
    <div class="container">
      <h1>Your UID</h1>
      <p class="uid">{{ uid ? uid : "Checking UID..." }}</p>
    </div>
  </template>
  
  <script>
  import { getCookie } from '../utils/cookies';
  
  export default {
    name: 'UidDisplay',
    data() {
      return {
        uid: null
      };
    },
    mounted() {
      // Delay the check by 500ms as in the original script.
      setTimeout(() => {
        console.log("Document cookies:", document.cookie);
        const uidCookie = getCookie("uid");
        if (uidCookie) {
          this.uid = uidCookie;
        } else {
          // Redirect to registration if no UID is found.
          window.location.href = "https://ds.manager.indigoingenium.ba/register_device";
        }
      }, 500);
    }
  };
  </script>
  
  <style scoped>
  /* Container styles */
  .container {
    background: #fff;
    padding: 20px 40px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    text-align: center;
    margin-top: 100px; /* Adjust as needed */
  }
  
  /* UID text styling */
  .uid {
    font-size: 1.5em;
    color: #0073e6;
    word-break: break-all;
  }
  </style>
  