import {boot} from 'quasar/wrappers'
import {Store} from "vuex";

interface PayPalButtonsStyle {
    layout?: 'vertical' | 'horizontal',
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black',
    shape?: 'rect' | 'pill',
    height?: number,
    disableMaxWidth?: boolean,
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment',
    tagline?: boolean
}

interface PayPalButtonsOptions {
    style?: PayPalButtonsStyle,
    createOrder?: (data: any, actions: any) => any,
    onApprove?: (data: any, actions: any) => any,
    onError?: (err: any) => void
}

interface PayPalRenderable {
    render: (target: string) => void;
}

interface PayPal {
    Buttons: (options: PayPalButtonsOptions) => PayPalRenderable;
}

function loadScript(url: string, className: string) {
    let loadedNodeList = document.querySelectorAll(className)
    if (loadedNodeList.length > 0) {
        // Script is already loaded
    } else {
        let myScript = document.createElement('script')
        myScript.src = url
        myScript.setAttribute('data-sdk-integration-source', 'button-factory')
        myScript.className = className
        document.body.appendChild(myScript)
    }
}

function loadPayPalLibrary(store: Store<any>) {
    let config = store.state.config.config
    if (config && config?.paypal?.clientId && !window.paypal) {
        console.log(`Loading PayPal library using client ID: ${config.paypal.clientId}`);
        loadScript(`https://www.paypal.com/sdk/js?client-id=${config.paypal.clientId}&enable-funding=venmo&currency=USD`, 'payPalScript')
    } else {
        console.log(`Can't load PayPal library - missing PayPal client configuration`);
    }
}

function usePayPal(): PayPal {
    return window.paypal as PayPal;
}

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async () => {
})

export {loadPayPalLibrary, usePayPal, PayPal}
