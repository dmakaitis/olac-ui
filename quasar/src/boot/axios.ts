import {boot} from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create(/*{ baseURL: 'https://api.example.com' }*/)

export default boot(({app, store}) => {
    // for use inside Vue files (Options API) through this.$axios and this.$api

    app.config.globalProperties.$axios = axios
    // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
    //       so you won't necessarily have to import axios in each vue file

    app.config.globalProperties.$api = api
    // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
    //       so you can easily perform requests against your app's API

    api.interceptors.request.use(function (config) {
        const token = store.state.auth.jwtToken;

        if (token) {
            console.log(`Axios: Adding access token: ${token}`);
            config.headers.Authorization = `${store.state.auth.jwtToken}`;
        } else {
            console.log('Axios: No access token');
        }

        return config;
    });
})

export {axios, api}
