var express = require('express');
var router = express.Router();
var moment = require('moment')

var { requestWS } = require('nodejs_idempierewebservice')
var { induvis } = require('../util/DB.js');

//var { getServerData, sendPackage } = require('./tecnico.js')

var btoa = txt => Buffer.from(txt, 'binary').toString('base64');

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
            { column: 'M_InOut_ID', val: payload.m_inout_id },
            { column: 'Description', val: btoa(payload.descripcion) }
        ]

        var resultado = await requestWS( induvis.host, 'crear_confirmacion_ws', payload.ctx, params)
        console.log('respuesta WS', resultado)

        res.json({ exito: true, msg: resultado })

    } catch (e) {
        console.error(e)
        res.json({exito: false, msg: `${e}`})
    }
})


/**
 * Ruta que crea un pago
 */
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
            { column: 'Description', val: btoa(req.body.description) }
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

/**
 * Ruta que crea una orden
 */
router.post('/induvis/orden/crear/', async function (req, res, next) {

    /*var data = {  
        "M_Warehouse_ID":1000020,
        "C_DocTypeTarget_ID":1000032,
        "C_BPartner":{  
           "AD_Org_ID":0,
           "C_BPartner_ID":1009126,
           "AD_Client_ID":1000004,
           "value":"1706751615",
           "Name":"CELSO ARTURO AYORA ZAMBRANO"
        },
        "updatedBy":1006796,
        "LoginInfo":{  
           "M_Warehouse_ID":1000020,
           "pass":"Ctigasi",
           "AD_Role_ID":1000011,
           "AD_Org_ID":1000003,
           "AD_Client_ID":1000004,
           "lang":"es_CO",
           "user":"ctigasi"
        },
        "SalesRep_ID":1006796,
        "C_PaymentTerm_ID":1000004,
        "description":"CREDITO 30 DIAS <<USR : ctigasi>>promoción más 2 lit rayvon 20w50 4T ",
        "M_PriceList_ID":1000007,
        "orderLines":[  
           {  
              "priceActual":3.5,
              "M_Product_ID":1008478,
              "qty":24,
              "discount":0,
              "C_UOM_ID":50003,
              "priceLimit":2.77,
              "priceEntered":3.5,
              "priceList":3.5
           }
        ],
        "createdBy":1006796,
        "AD_Org_ID":1000003,
        "C_DocType_ID":1000032,
        "PaymentRule":"P",
        "AD_Client_ID":1000004
     }*/

     var data = req.body;

    try {
        var params = [
            { column: 'AD_Client_ID', val: Number(data['AD_Client_ID'])  },
            { column: 'AD_Org_ID', val: Number(data['AD_Org_ID'])  },

            { column: 'M_Warehouse_ID', val: Number(data['M_Warehouse_ID'])  },
            { column: 'C_DocTypeTarget_ID', val: Number(data['C_DocTypeTarget_ID'])  },
            { column: 'C_BPartner_ID', val: Number(data['C_BPartner']['C_BPartner_ID'])  },
            { column: 'SalesRep_ID', val: Number(data['SalesRep_ID'])  },
            { column: 'C_PaymentTerm_ID', val: Number(data['C_PaymentTerm_ID'])  },
            { column: 'Description', val: btoa(data['description']) },
            { column: 'M_PriceList_ID', val: Number(data['M_PriceList_ID'])  },
            { column: 'C_DocType_ID', val: Number(data['C_DocType_ID'])  },
            { column: 'PaymentRule', val: data['PaymentRule']  },

            { column: 'line_priceActual', val: data['orderLines'].map(linea => linea['priceActual']).join('_')  },
            { column: 'line_M_Product_ID', val: data['orderLines'].map(linea => linea['M_Product_ID']).join('_')  },
            { column: 'line_qty', val: data['orderLines'].map(linea => linea['qty']).join('_')  },
            { column: 'line_discount', val: data['orderLines'].map(linea => linea['discount']).join('_')  },
            { column: 'line_C_UOM_ID', val: data['orderLines'].map(linea => linea['C_UOM_ID']).join('_')  },
            { column: 'line_priceLimit', val: data['orderLines'].map(linea => linea['priceLimit']).join('_')  },
            { column: 'line_priceList', val: data['orderLines'].map(linea => linea['priceList']).join('_')  },
            { column: 'line_priceEntered', val: data['orderLines'].map(linea => linea['priceEntered']).join('_')  },
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
        
        var resultado = await requestWS( induvis.host, 'crear_orden_ws', context, params)
        resultado = resultado.split('||||')

        var json = { }
        json['C_Order_ID'] = Number( resultado[0] )
        json['documentNo'] = resultado[1]

        console.log('respuesta WS', json)
        res.json({ exito: true, ...json, msg: `Orden ${resultado[1]} creada exitosamente` })

    } catch (e) {
        console.error(e)
        res.json({exito: false, msg: `${e}`})
    }
})

module.exports = router;