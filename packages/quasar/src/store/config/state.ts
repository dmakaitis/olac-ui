import {ConfigState} from "src/util/types";

export default function (): ConfigState {
    return {
        config: {
            paypal: {
                apiBase: '',
                clientId: '',
                donationButtonId: ''
            },
            cognito: {
                domain: '',
                clientId: '',
                redirectUri: ''
            },
            showLogin: false,
        }
    }
}
