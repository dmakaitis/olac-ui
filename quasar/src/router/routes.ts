import MainLayout from "layouts/MainLayout.vue";
import MainAbout from "pages/MainAbout.vue";
import MainArticle from "pages/MainArticle.vue";
import MainTickets from "pages/MainTickets.vue";

import AdminLayout from "layouts/AdminLayout.vue";
import AdminReservations from "pages/AdminReservations.vue";

import LoginUser from "pages/LoginUser.vue";
import LogoutUser from "pages/LogoutUser.vue";
import AdminEvents from "pages/AdminEvents.vue";
import {RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    name: 'Login',
    path: '/login',
    component: LoginUser
  },
  {
    name: 'Logout',
    path: '/logout',
    component: LogoutUser
  },
  {
    name: 'Home',
    path: '/',
    redirect: {path: '/main/article/home'}
  },
  {
    name: 'Main',
    path: '/main',
    component: MainLayout,
    children: [
      {
        name: 'About OLAC',
        path: 'about',
        component: MainAbout
      },
      {
        path: 'article/:slug',
        component: MainArticle
      },
      {
        name: 'Event Information and Registration',
        path: 'tickets',
        component: MainTickets
      }
    ]
  },
  {
    name: 'Admin',
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        name: 'Events',
        path: 'events',
        component: AdminEvents
      },
      {
        name: 'Reservation Administration',
        path: 'reservations',
        component: AdminReservations,
        meta: {
          requiresAuth: true
        }
      }
    ]
  }

  // Always leave this as last one,
  // but you can also remove it
  // {
  //   path: '/:catchAll(.*)*',
  //   component: () => import('pages/ErrorNotFound.vue')
  // }
]

export default routes;
