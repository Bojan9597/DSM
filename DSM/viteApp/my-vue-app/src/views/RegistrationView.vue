<!-- src/views/RegistrationView.vue -->
<template>
    <div class="container">
      <h1>Your UID Cookie</h1>
      <p class="uid">{{ uid }}</p>
      <p class="attempts">Attempt #{{ attemptCount }}</p>
    </div>
  </template>
  
  <script>
  import { getCookie, setCookie, generateUid } from '../utils/cookies';
  
  export default {
    name: 'RegistrationView',
    data() {
      return {
        uid: '',
        attemptCount: 0
      };
    },
    mounted() {
      this.uid = getCookie("uid");
      if (!this.uid) {
        this.uid = generateUid();
        setCookie("uid", this.uid, 365);
      }
      this.uid = this.uid.toLowerCase();
      this.checkRegistration();
    },
    methods: {
      checkRegistration() {
        this.attemptCount++;
        const payload = { uuid: this.uid };
        console.log('Checking registration with payload:', payload);
        fetch('https://ds.manager.indigoingenium.ba/check_if_registered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(response => response.json())
          .then(data => {
            console.log('Response received:', data);
            if (data.Redirect) {
              console.log("Received redirect:", data.Redirect);
              window.location.href = data.Redirect;
            } else if (data["Non-redirect"] === "Device not registered") {
              setTimeout(this.checkRegistration, 3000);
            } else {
              setTimeout(this.checkRegistration, 3000);
            }
          })
          .catch(error => {
            console.error('Error checking registration:', error);
            setTimeout(this.checkRegistration, 3000);
          });
      }
    }
  };
  </script>
  
  <style scoped>
  body {
    font-family: Arial, sans-serif;
    background-color: #f7f7f7;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100vh;
    margin: 0;
  }
  .container {
    background: #fff;
    padding: 20px 40px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    text-align: center;
  }
  .uid {
    font-size: 1.5em;
    color: #0073e6;
    word-break: break-all;
  }
  .attempts {
    margin-top: 20px;
    font-size: 1em;
    color: #555;
  }
  </style>
  