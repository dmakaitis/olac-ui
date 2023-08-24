import {boot} from 'quasar/wrappers'
import {api} from './axios'
import {loadPayPalLibrary} from "../boot/paypal";
import {ClientConfig} from "../util/types";
import {AxiosResponse} from "axios";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({app, store}) => {
    api.get('/api/public/client-config')
        .then((response: AxiosResponse<ClientConfig>) => {
            console.log(`Loaded client configuration: ${JSON.stringify(response.data)}`);
            store.commit('config/storeConfig', response.data);

            loadPayPalLibrary(store)
        })
})
