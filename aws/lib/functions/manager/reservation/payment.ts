import axios from "axios";
import {Payment, Reservation} from "./reservation";

export async function validateAndAddOnlinePayment(reservation: Reservation, paymentProcessorTransactionId: string, username: string): Promise<Reservation> {
    console.log(`validateAndAddOnlinePayment(${JSON.stringify(reservation)}, ${paymentProcessorTransactionId}, ${username})...`);

    if (!reservation || !paymentProcessorTransactionId) {
        return reservation;
    }

    // Load the actual transaction from PayPal since the one we have could have been altered...
    const response = await getOrder(paymentProcessorTransactionId);
    if (!response) {
        // Not a valid transaction
        return reservation;
    }

    // Search through the transaction for our reservation in order to find the amount paid...
    const payment = buildOnlinePayment(reservation.id || 'no-id', paymentProcessorTransactionId, response, username);
    if (!payment) {
        return reservation;
    }

    reservation.payments.push(payment);

    return reservation;
}

function buildOnlinePayment(id: string, paymentProcessorTransactionId: string, response: any, username: string): Payment | undefined {
    console.log(`buildOnlinePayment(${id}, ${paymentProcessorTransactionId}, ${JSON.stringify(response)}, ${username})...`);

    // Search through the transaction for our reservation in order to find the amount paid...
    const amount = getPaymentAmount(id, response);

    if (amount <= 0) {
        // Could not find purchase unit with payment for reservation
        return undefined;
    }

    // Record the payment:
    const payment: Payment = {
        amount,
        status: 'SUCCESSFUL',
        method: "ONLINE",
        notes: `PayPal Transaction ID: ${paymentProcessorTransactionId}`,
        enteredBy: username
    }

    if (response.create_time) {
        payment.createdTimestamp = response.create_time;
    }

    console.log(`buildOnlinePayment(${id}, ${paymentProcessorTransactionId}, ${JSON.stringify(response)}, ${username}) => ${JSON.stringify(payment)}`);

    return payment;
}

function getPaymentAmount(reservationId: string, response: any): number {
    console.log(`getPaymentAmount(${reservationId}, ${JSON.stringify(response)})...`);

    const purchaseUnits = response.purchase_units || [];

    const paymentAmount = purchaseUnits
        .filter((p: any): boolean => p.custom_id === reservationId)
        .filter((p: any): boolean => p.amount?.value)
        .map((p: any): number => +p.amount.value)
        .reduce((a: number, b: number) => a + b, 0);

    console.log(`getPaymentAmount(${reservationId}, ${JSON.stringify(response)}) => ${paymentAmount}`);

    return paymentAmount;
}

async function getOrder(paymentProcessorTransactionId: string): Promise<any> {
    console.log(`paymentProcessorTransactionId(${paymentProcessorTransactionId})...`);

    const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
    const bearerToken = await getAccessToken();

    const response = await axios.get(`${apiBase}/v2/checkout/orders/${paymentProcessorTransactionId}`, {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    });

    console.log(`paymentProcessorTransactionId(${paymentProcessorTransactionId}) => ${JSON.stringify(response.data)}`);

    return response.data;
}

async function getAccessToken(): Promise<string> {
    console.log(`getAccessToken()...`);

    const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
    const clientId = process.env.PAYPAL_CLIENT_ID || 'Abho_XH0WoNgTUb4dlLPUXvKzWWhrBVrgVoZcc6O3YSZL80WKf-f8F6ow09WZnrL4QnOmX7yz46GCzdc';
    const clientSecret = process.env.PAYPAL_SECRET || 'EHvGFTVVzX8iKJ6rGl0L3--NxTU3qIphBYBytPMG-gkeVSmHQJPEujRGSmT73aftkd5G1qJdWFHNT5S2';

    const response = await axios.request({
        url: '/v1/oauth2/token',
        method: 'post',
        baseURL: apiBase,
        auth: {
            username: clientId,
            password: clientSecret
        },
        data: 'grant_type=client_credentials'
    });

    return response.data.access_token;
}

