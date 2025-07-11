import * as React from 'react';
import { NativeModules } from 'react-native'

export const VnpayMerchantModule = NativeModules.VnpayMerchant

interface ShowParam {
    isSandbox?: boolean,
    scheme: string
    backAlert?: string
    paymentUrl?: string
    title?: string
    titleColor?: string
    beginColor?: string
    endColor?: string
    iconBackName?: string,
    tmn_code: string,
}
const VNPMerchant = {
    show(params: ShowParam) {
        let _params: Partial<ShowParam> = Object.assign({
            isSandbox: true, //"true": môi trường test || "false": môi trường live
            paymentUrl: 'https://sandbox.vnpayment.vn/tryitnow/Home/CreateOrder', // Đây là URL demo của VNAPAY. URL merchant thanh toán merchant tạo. Tham khảo tại "https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html#tao-url-thanh-toan"
			
            tmn_code: 'XXXXXXXX', // TmnCode VNPAY cung cấp
            backAlert: 'Bạn có chắc chắn trở lại ko?',
            title: 'Thanh toán',
            iconBackName: 'ion_back',
            beginColor: '#F06744',
            endColor: '#E26F2C',
            titleColor: '#E26F2C',
        }, params)
        _params.titleColor = _params.titleColor?.replace(/#/g, '')
        _params.beginColor = _params.beginColor?.replace(/#/g, '')
        _params.endColor = _params.endColor?.replace(/#/g, '')
        console.log('show', _params)
        VnpayMerchantModule.show(
            _params.scheme,
            _params.isSandbox,
            _params.paymentUrl,
            _params.tmn_code,
            _params.backAlert,
            _params.title,
            _params.titleColor,
            _params.beginColor,
            _params.endColor,
            _params.iconBackName
        )
    }
}
export default VNPMerchant