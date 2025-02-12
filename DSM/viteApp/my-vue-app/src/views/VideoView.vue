<!-- src/views/VideoView.vue -->
<template>
    <div class="video-container" ref="videoContainer">
      <video
        class="fullscreen-video"
        ref="videoElement"
        autoplay
        muted
        playsinline
        controls
      ></video>
    </div>
  </template>
  
  <script>
  import { getCookie } from '../utils/cookies';
  
  export default {
    name: 'VideoView',
    data() {
      return {
        uid: null,
        currentAdUrl: '',
        nextAdUrl: '',
        isFetching: false
      };
    },
    mounted() {
      // Register the service worker.
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }
  
      // Retrieve UID from cookie; if not present, redirect to registration.
      this.uid = getCookie("uid");
      if (!this.uid) {
        this.$router.push('/origin');
        return;
      }
  
      this.videoElement = this.$refs.videoElement;
      this.videoContainer = this.$refs.videoContainer;
  
      // Fetch and play the initial ad.
      this.fetchAd().then(url => {
        if (url) {
          this.currentAdUrl = url;
          this.playAd(this.currentAdUrl);
          this.prefetchNextAd();
        }
      });
  
      // Listen for video end.
      this.videoElement.addEventListener('ended', this.handleVideoEnded);
  
      // Request fullscreen when metadata is loaded.
      this.videoElement.addEventListener('loadedmetadata', this.requestFullScreen);
  
      // Focus reporting.
      window.addEventListener('focus', () => this.reportFocus(true));
      window.addEventListener('blur', () => this.reportFocus(false));
    },
    beforeUnmount() {
      if (this.videoElement) {
        this.videoElement.removeEventListener('ended', this.handleVideoEnded);
        this.videoElement.removeEventListener('loadedmetadata', this.requestFullScreen);
      }
      window.removeEventListener('focus', this.reportFocus);
      window.removeEventListener('blur', this.reportFocus);
    },
    methods: {
      async fetchAd() {
        const url = 'https://ds.manager.indigoingenium.ba/get_ad';
        const payload = { uuid: this.uid };
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await response.json();
          if (data.name === 'Redirection') {
            window.location.href = data.url;
            return null;
          } else if (data.name === 'Advertisement') {
            const dataString = JSON.stringify(data).toLowerCase();
            if (dataString.indexOf('ds.manager') !== -1) {
              window.location.href = 'https://ds.manager.indigoingenium.ba/register_device';
              return null;
            } else {
              return data.url;
            }
          }
        } catch (error) {
          console.error('Error fetching ad:', error);
        }
        return null;
      },
      prefetchNextAd() {
        if (this.isFetching) return;
        this.isFetching = true;
        this.fetchAd().then(url => {
          if (url) {
            this.nextAdUrl = url;
            console.log('Prefetched next ad:', this.nextAdUrl);
          }
          this.isFetching = false;
        });
      },
      playAd(url) {
        if (!url) return;
        this.videoElement.pause();
        this.videoElement.src = url;
        this.videoElement.load();
        this.videoElement.play().catch(err => console.error('Error playing video:', err));
      },
      handleVideoEnded() {
        if (this.nextAdUrl) {
          this.currentAdUrl = this.nextAdUrl;
          this.nextAdUrl = "";
          this.playAd(this.currentAdUrl);
          this.prefetchNextAd();
        } else {
          this.fetchAd().then(url => {
            if (url) {
              this.currentAdUrl = url;
              this.playAd(this.currentAdUrl);
              this.prefetchNextAd();
            }
          });
        }
      },
      requestFullScreen() {
        if (!document.fullscreenElement) {
          const el = this.videoContainer;
          if (el.requestFullscreen) {
            el.requestFullscreen().catch(console.error);
          } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
          } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
          } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
          }
        }
      },
      reportFocus(isFocused) {
        const reportUrl = 'https://ds.manager.indigoingenium.ba/report_focus';
        const payload = {
          uuid: this.uid,
          date: new Date().toISOString(),
          is_in_focus: isFocused ? 1 : 0
        };
        fetch(reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(error => {
          console.error('Error reporting focus:', error);
        });
      }
    }
  };
  </script>
  
  <style scoped>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #000;
  }
  .video-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #000;
    z-index: 9999;
  }
  .fullscreen-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: #000;
  }
  </style>
  