import {ConfigState} from "../../util/types";

export function showLogin(state: ConfigState): boolean {
    console.log(`Show login: ${state.config?.showLogin}`);
    return state.config?.showLogin || false;
}

export function cognito(state: ConfigState) {
    console.log(`Cognito settings: ${JSON.stringify(state.config?.cognito)}`);
    return state.config?.cognito;
}

export function payPalDonationButtonId(state: ConfigState) {
    console.log(`Donation button ID: ${state.config?.paypal?.donationButtonId}`);
    return state.config?.paypal?.donationButtonId;
}
