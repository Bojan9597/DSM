// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import VideoView from '../views/VideoView.vue';
import RegistrationView from '../views/RegistrationView.vue';
import Showuuid from '../views/Showuuid.vue';
const routes = [
  {
    path: '/origin',
    name: 'Video',
    component: VideoView
  },
  {
    path: '/register_device',
    name: 'Registration',
    component: RegistrationView
  },
{
    path: '/show_uuid',
    name: 'UidDisplay',
    component: Showuuid
},
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
