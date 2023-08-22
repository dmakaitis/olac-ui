import {boot} from 'quasar/wrappers'

function loadScript(url, className) {
  let isLoaded = document.querySelectorAll(className)
  if (isLoaded.length > 0) {
    // Script is already loaded
  } else {
    let myScript = document.createElement('script')
    myScript.src = url
    myScript.setAttribute('data-sdk-integration-source', 'button-factory')
    myScript.className = className
    document.body.appendChild(myScript)
  }
}

function loadPayPalLibrary(store) {
  let config = store.state.config.config
  if (config && config.paypal && !window.paypal) {
    console.log(`Loading PayPal library using client ID: ${config.paypal.clientId}`);
    loadScript(`https://www.paypal.com/sdk/js?client-id=${config.paypal.clientId}&enable-funding=venmo&currency=USD`, 'payPalScript')
  } else {
    console.log(`Can't load PayPal library - missing PayPal client configuration`);
  }
}

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async () => {
})

export {loadPayPalLibrary}
