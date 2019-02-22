var express = require('express');
var router = express.Router();
var moment = require('moment')

var { requestWS } = require('nodejs_idempierewebservice')
var { induvis } = require('../util/DB.js');

//var { getServerData, sendPackage } = require('./tecnico.js')

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
})

router.post('/induvis/confirmacion/crear/', async function (req, res, next) {

    try {
        var payload = req.body    

        console.log(payload)

        var params = [
            {
                column: 'M_InOut_ID', 
                val: payload.m_inout_id
            },{
                column: 'Description', 
                val: payload.descripcion
            }
        ]

        var resultado = await requestWS( induvis.host, 'crear_confirmacion_ws', payload.ctx, params)
        console.log('respuesta WS', resultado)

        res.json({ exito: true, msg: resultado })

    } catch (e) {
        console.error(e)
        res.json({exito: false, msg: `${e}`})
    }
})

router.post('/induvis/pago/crear/', async function (req, res, next) {

    try {
        var params = [
            { column: 'AD_Org_ID', val: req.body['AD_Org_ID'] },
            { column: 'C_BPartner_ID', val: Number( req.body['C_BPartner']['C_BPartner_ID'] ) },
            { column: 'PayAmt', val: Number( req.body['Payments'][0]['PayAmt'] ) },
            { column: 'A_Name', val: req.body['Payments'][0]['A_Name'] },
            { column: 'RoutingNo', val: req.body['Payments'][0]['RoutingNo'] },
            { column: 'C_BankAccount_ID', val: Number( req.body['Payments'][0]['C_BankAccount_ID'] ) },
            { column: 'C_Currency_ID', val: Number( req.body['Payments'][0]['C_Currency_ID'] ) },
            { column: 'TenderType', val: req.body['Payments'][0]['TenderType'] },
            { column: 'C_DocType_ID', val: Number( req.body['C_DocType_ID'] ) },
            { column: 'C_Invoice_ID', val: Number( req.body['C_Invoice_ID'] ) },
            { column: 'DateTrx', val: moment(req.body['dateTrx'], "YYYY-MM-DD").format('YYYY-MM-DD') + ' 00:00:00' },
            { column: 'Description', val: req.body.description }
        ]

        var context = {
            username: req.body['LoginInfo']['user'],
            password: req.body['LoginInfo']['pass'],
            ad_client_id: req.body['LoginInfo']['AD_Client_ID'],
            ad_role_id: req.body['LoginInfo']['AD_Role_ID'],
            ad_org_id: req.body['LoginInfo']['AD_Org_ID'],
            m_warehouse_id: req.body['LoginInfo']['M_Warehouse_ID']
        }

        console.log(params)
        
        var resultado = await requestWS( induvis.host, 'crear_pago_ws', context, params)
        resultado = resultado.split('____')

        var json = { }
        json['C_Order_ID'] = Number( resultado[0] )
        json['C_Invoice_ID'] = Number( resultado[1] )
        json['payments'] = [{}]
        json['payments'][0]['C_Payment_ID'] = Number( resultado[2] )
        json['payments'][0]['DocumentNo'] = resultado[3]
        json['payments'][0]['PayAmt'] = Number( resultado[4] )
        json['payments'][0]['TenderType'] = resultado[5]
        json['paymentRemain'] = Number( resultado[6] )

        console.log('respuesta WS', json)
        res.json({ exito: true, ...json })

    } catch (e) {
        console.error(e)
        res.json({exito: false, msg: `${e}`})
    }
})

module.exports = router;