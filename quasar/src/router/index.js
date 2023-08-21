import {route} from 'quasar/wrappers'
import {createMemoryHistory, createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import routes from './routes'
import {api} from 'boot/axios'
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({store /*, ssrContext */}) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({left: 0, top: 0}),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    var tokens = parseTokens(to);
    console.log(`OIDS Tokens: ${JSON.stringify(tokens)}`);

    if (tokens.access_token) {
      console.log('Storing access token...');
      store.commit('auth/storeAuthentication', {
        jwtToken: tokens.access_token,
        username: 'authenticated',
        grants: []
      });

      // Now, call the who-am-i method in order to get the endpoints
      // (we needed to store the JWT token first so it will be included in the request)

      api.get("/api/auth/who-am-i")
        .then(response => {
          console.log(`Who am I repsonse: ${JSON.stringify(response.data)}`)
          store.commit('auth/storeAuthentication', {
            jwtToken: tokens.access_token,
            username: response.data.username,
            grants: response.data.grants
          });

          // Update our configuration so the login button will now show for the rest of the session:
          this.store.commit('config/setShowLogin', true);
        });

      next({name: 'Home'});
    } else {
      if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!store.getters['auth/isLoggedIn']) {
          next({name: 'Login'})
        } else {
          next()
        }
      } else {
        next()
      }
    }
  })

  Router.afterEach((to, from, next) => {
    gtag('event', 'page_view', {
      page_title: to.name,
      page_location: to.fullPath
    })
  })

  return Router
})

function parseTokens(to) {
  var tokens = {};

  var path = to.fullPath.slice(1);

  var pathParts = path.split("&");
  pathParts.forEach(part => {
    var pieces = part.split("=");
    if (pieces.length == 2) {
      tokens[pieces[0]] = pieces[1];
    }
  })

  return tokens;
}
