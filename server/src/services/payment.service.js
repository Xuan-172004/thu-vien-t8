const crypto = require('crypto');
const https = require('https');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const dayjs = require('dayjs');

const { User, DepositTransaction } = require('../models');
const { BadRequestError, NotFoundError } = require('../core/error.response');

function generateTxnRef() {
    const now = new Date();
    return `DEP${now.getTime()}${now.getSeconds().toString().padStart(2, '0')}`;
}

class PaymentService {
    async createDepositPayment(userId, amount, paymentMethod = 'vnpay') {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFoundError('Tài khoản người dùng không tồn tại');
        }

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount < 10000) {
            throw new BadRequestError('Số tiền nạp tối thiểu là 10.000 VNĐ');
        }

        const txnRef = generateTxnRef();

        if (paymentMethod === 'momo') {
            return new Promise(async (resolve, reject) => {
                try {
                    const accessKey = 'F8BBA842ECF85';
                    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
                    const partnerCode = 'MOMO';
                    const orderId = txnRef;
                    const requestId = orderId;
                    const orderInfo = `Nap tien vi coc cho user ${user.fullName}`;
                    const redirectUrl = 'http://localhost:3000/api/payment/momo-return';
                    const ipnUrl = 'http://localhost:3000/api/payment/momo-return';
                    const requestType = 'payWithMethod';
                    const extraData = '';

                    const rawSignature =
                        'accessKey=' + accessKey +
                        '&amount=' + numericAmount +
                        '&extraData=' + extraData +
                        '&ipnUrl=' + ipnUrl +
                        '&orderId=' + orderId +
                        '&orderInfo=' + orderInfo +
                        '&partnerCode=' + partnerCode +
                        '&redirectUrl=' + redirectUrl +
                        '&requestId=' + requestId +
                        '&requestType=' + requestType;

                    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

                    const requestBody = JSON.stringify({
                        partnerCode,
                        partnerName: 'ThueSach PRO',
                        storeId: 'ThueSachStore',
                        requestId,
                        amount: numericAmount,
                        orderId,
                        orderInfo,
                        redirectUrl,
                        ipnUrl,
                        lang: 'vi',
                        requestType,
                        autoCapture: true,
                        extraData,
                        orderGroupId: '',
                        signature,
                    });

                    const options = {
                        hostname: 'test-payment.momo.vn',
                        port: 443,
                        path: '/v2/gateway/api/create',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(requestBody),
                        },
                    };

                    const req = https.request(options, (res) => {
                        let data = '';
                        res.on('data', (chunk) => { data += chunk; });
                        res.on('end', async () => {
                            try {
                                const parsed = JSON.parse(data);
                                await DepositTransaction.create({
                                    txnRef,
                                    userId,
                                    amount: numericAmount,
                                    paymentMethod: 'momo',
                                    payUrl: parsed.payUrl || parsed.shortLink || '',
                                    status: 'pending',
                                });
                                resolve({
                                    payUrl: parsed.payUrl || parsed.shortLink || redirectUrl,
                                    txnRef,
                                    amount: numericAmount,
                                });
                            } catch (err) {
                                reject(err);
                            }
                        });
                    });

                    req.on('error', (e) => reject(e));
                    req.write(requestBody);
                    req.end();
                } catch (e) {
                    reject(e);
                }
            });
        } else {
            // VNPay Sandbox
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true,
                hashAlgorithm: 'SHA512',
                loggerFn: ignoreLogger,
            });

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const payUrl = await vnpay.buildPaymentUrl({
                vnp_Amount: numericAmount,
                vnp_IpAddr: '127.0.0.1',
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: `Nap tien vi coc thu vien user ${user.fullName}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/payment/vnpay-return`,
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: dateFormat(new Date()),
                vnp_ExpireDate: dateFormat(tomorrow),
            });

            await DepositTransaction.create({
                txnRef,
                userId,
                amount: numericAmount,
                paymentMethod: 'vnpay',
                payUrl,
                status: 'pending',
            });

            return {
                payUrl,
                txnRef,
                amount: numericAmount,
            };
        }
    }

    async vnpayCallback(query) {
        const { vnp_ResponseCode, vnp_TxnRef, vnp_Amount } = query;
        const transaction = await DepositTransaction.findOne({ where: { txnRef: vnp_TxnRef } });

        if (!transaction) {
            return 'http://localhost:5173/payment-success?status=error';
        }

        if (vnp_ResponseCode === '00' && transaction.status !== 'success') {
            transaction.status = 'success';
            await transaction.save();

            const user = await User.findByPk(transaction.userId);
            if (user) {
                user.walletBalance = (user.walletBalance || 0) + transaction.amount;
                await user.save();
            }

            return `http://localhost:5173/payment-success?status=success&amount=${transaction.amount}&txnRef=${transaction.txnRef}&method=vnpay`;
        } else {
            transaction.status = 'failed';
            await transaction.save();
            return `http://localhost:5173/payment-success?status=failed&txnRef=${transaction.txnRef}`;
        }
    }

    async momoCallback(query) {
        const { resultCode, orderId } = query;
        const transaction = await DepositTransaction.findOne({ where: { txnRef: orderId } });

        if (!transaction) {
            return 'http://localhost:5173/payment-success?status=error';
        }

        if (String(resultCode) === '0' && transaction.status !== 'success') {
            transaction.status = 'success';
            await transaction.save();

            const user = await User.findByPk(transaction.userId);
            if (user) {
                user.walletBalance = (user.walletBalance || 0) + transaction.amount;
                await user.save();
            }

            return `http://localhost:5173/payment-success?status=success&amount=${transaction.amount}&txnRef=${transaction.txnRef}&method=momo`;
        } else {
            transaction.status = 'failed';
            await transaction.save();
            return `http://localhost:5173/payment-success?status=failed&txnRef=${transaction.txnRef}`;
        }
    }

    async getDepositHistory(userId) {
        return await DepositTransaction.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
    }
}

module.exports = new PaymentService();
