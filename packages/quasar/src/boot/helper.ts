import {boot} from 'quasar/wrappers'

const currency = (value: number): string => {
    const numberFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    return numberFormat.format(value)
}

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async () => {

})

export {
    currency
}
