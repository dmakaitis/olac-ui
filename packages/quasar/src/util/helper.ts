const currency = (value: number): string => {
    const numberFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    return numberFormat.format(value)
}

export default {
    currency
}
