export function showLogin(state) {
  console.log(`Show login: ${state.config.showLogin}`);
  return state.config.showLogin;
}

export function enableReservations(state) {
  console.log(`Enable reservations: ${state.config.enableReservations}`);
  return state.config.enableReservations;
}

export function cognito(state) {
  console.log(`Cognito settings: ${JSON.stringify(state.config.cognito)}`);
  return state.config.cognito;
}

export function payPalDonationButtonId(state) {
  console.log(`Donation button ID: ${state.config.paypal.donationButtonId}`);
  return state.config.paypal.donationButtonId;
}
