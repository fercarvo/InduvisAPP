var express = require('express');
var router = express.Router();
var moment = require('moment')

var { requestWS } = require('nodejs_idempierewebservice')
var { induvis } = require('../util/DB.js');

//var { getServerData, sendPackage } = require('./tecnico.js')

var btoa = txt => Buffer.from((txt || '') , 'binary').toString('base64');

/**
 * Convierte un valor a numero, caso contrario retorna ""
 * @param {*} value numero
 */
function toNumber (value) {
    if (value === null || value === undefined || isNaN(value)) {
        return ''
    } else {
        return Number(value)
    }
}

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    next();
})

router.post('/induvis/confirmacion/crear/', async function (req, res, next) {

    try {
        var payload = req.body    
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

    /*{
        "C_BPartner":{
            "C_BPartner_ID":1007374,
            "value":"1715753529001",
            "Name":"ÑACATA RUIZ HENRY PATRICIO"
        },
        "updatedBy":1006540,
        "LoginInfo": {
            "M_Warehouse_ID":1000020,
            "AD_Role_ID":1000011,
            "pass":"bea342516",
            "AD_Org_ID":1000003,
            "AD_Client_ID":1000004,
            "lang":"es_CO",
            "user":"rguerra"
        },
        "createdBy":1006540,
        "AD_Org_ID":1000003,
        "description":"<<USR: rguerra >> ; FAC: 003-001-000010835; RPG: 44839; OBS: CANCELADO 6/12/2028 RECIBO # 44839",
        "Payments":[{
            "PayAmt":20,
            "A_Name":"ÑACATA RUIZ HENRY PATRICIO",
            "RoutingNo":"",
            "C_Currency_ID":100,
            "C_BankAccount_ID":1000002,
            "TenderType":"X"
        }],
        "C_DocType_ID":1000008,
    
        "C_Invoice_ID":1030525,
        "SalesRep_ID": 1231231,
        "CodigoRecibo": "44839",
    
        "dateTrx":"2018-12-06",
        "AD_Client_ID":1000004
    }*/
    console.log(req.body)


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
            { column: 'Description', val: btoa(req.body.description) },
            { column: 'SalesRep_ID', val: Number(req.body['SalesRep_ID']) },
            { column: 'CodigoRecibo', val: btoa(req.body['CodigoRecibo']) }
        ]

        var context = {
            username: req.body['LoginInfo']['user'],
            password: req.body['LoginInfo']['pass'],
            ad_client_id: req.body['LoginInfo']['AD_Client_ID'],
            ad_role_id: req.body['LoginInfo']['AD_Role_ID'],
            ad_org_id: req.body['LoginInfo']['AD_Org_ID'],
            m_warehouse_id: req.body['LoginInfo']['M_Warehouse_ID']
        }
        
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
     console.log(data)


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

/**
 * Ruta que actualiza el tercero
 */
router.post('/induvis/tercero/actualizar/', async function (req, res, next) {

    /*{
        "C_BPartner":{
            "C_BPartner_ID":1007374,
            "value":"1715753529001",
            "Name2": "Los pollos hermanos",
            "SalesRep_ID": 1023562
        },
        "activo": false,
        "C_BPartner_Location": {
            "C_BPartner_Location_ID": 1234567,
            "C_SalesRegion_ID": 9874563,
            "Phone": "+593985663256",
            "Phone2": "+1256910001",
            "Address1": "Alborada 8",
            "Address2": "Machala y nueve de octubre",

            "Address3": "foo bar loc",
            "codigo_provincia": "18",
            "codigo_ciudad": "1809",

            "frecuencia_visita": 12,
            "hora_apertura": "07:50",
            "hora_cierre": "17:55",
            "fecha_apertura": "2006-12-01",

            "Latitud": -2.1679741,
            "Longitud": -79.9057572
        },
        "LoginInfo": {
            "M_Warehouse_ID":1000020,
            "AD_Role_ID":1000011,
            "pass":"foobar",
            "AD_Org_ID":1000003,
            "AD_Client_ID":1000004,
            "lang":"es_CO",
            "user":"hola.mundo"
        },
        "AD_User":{
            "AD_User_ID":1000002,
            "EMail": "foo@bar.ec",
            "Birthday": "2001-12-06"
        },
        "tipo_negocio": {
            "Value": "0007",
            "Description": "COMERCIO"
        }
    }*/

     var data = req.body;
     console.log(data)

    try {
        var params = [
            { column: 'C_BPartner_ID', val: Number(data['C_BPartner']['C_BPartner_ID'])  },
            { column: 'Name2', val: btoa( data['C_BPartner']['Name2'] )  },
            { column: 'SalesRep_ID', val: Number(data['C_BPartner']['SalesRep_ID'])  },

            { column: 'C_BPartner_Location_ID', val: Number(data['C_BPartner_Location']['C_BPartner_Location_ID'])  },
            { column: 'C_SalesRegion_ID', val: Number(data['C_BPartner_Location']['C_SalesRegion_ID'])  },
            { column: 'Phone', val: data['C_BPartner_Location']['Phone']  },
            { column: 'Phone2', val: data['C_BPartner_Location']['Phone2']  },
            { column: 'Address1', val: btoa( data['C_BPartner_Location']['Address1'] )  },
            { column: 'Address2', val: btoa( data['C_BPartner_Location']['Address2'] )  },
            { column: 'Address3', val: btoa( data['C_BPartner_Location']['Address3'] )  },
            { column: 'codigo_provincia', val: data['C_BPartner_Location']['codigo_provincia']  },
            { column: 'codigo_ciudad', val: data['C_BPartner_Location']['codigo_ciudad']  },
            { column: 'Latitud', val: Number(data['C_BPartner_Location']['Latitud'])  },
            { column: 'Longitud', val: Number(data['C_BPartner_Location']['Longitud'])  },
            { column: 'frecuencia_visita', val: toNumber(data['C_BPartner_Location']['frecuencia_visita'])  },
            
            { column: 'hora_apertura', val: (()=>{
                var hora = data['C_BPartner_Location']['hora_apertura']
                var hora_apertura = moment(hora, 'hh:mm')

                if (!hora_apertura.isValid())
                    return null;
                
                return '2018-01-01 '+hora+':00';
            })() },

            { column: 'hora_cierre', val: (()=>{
                var hora = data['C_BPartner_Location']['hora_cierre']
                var hora_cierre = moment(hora, 'hh:mm')

                if (!hora_cierre.isValid())
                    return null;
                
                return '2018-01-01 '+hora+':00';
            })() },

            { column: 'fecha_apertura', val: (()=>{
                var fecha = data['C_BPartner_Location']['fecha_apertura']
                var fecha_apertura = moment(fecha, 'YYYY-MM-DD')

                if (!fecha_apertura.isValid())
                    return null;
                
                return fecha+' 00:00:00'
            })() },

            { column: 'AD_User_ID', val: Number(data['AD_User']['AD_User_ID'])  },
            { column: 'EMail', val: data['AD_User']['EMail']  },
            { column: 'Birthday', val: moment(data['AD_User']['Birthday'], "YYYY-MM-DD").format('YYYY-MM-DD') + ' 00:00:00'  },

            { column: "tipo_negocioCodigo", val: btoa( data['tipo_negocio']['Value'] ) },
            { column: "tipo_negocioDescripcion", val: btoa( data['tipo_negocio']['Description'] ) },
            { column: "terceroActivo", val: data.activo === true ? 'Y' : 'N'}
        ]

        var context = {
            username: req.body['LoginInfo']['user'],
            password: req.body['LoginInfo']['pass'],
            ad_client_id: req.body['LoginInfo']['AD_Client_ID'],
            ad_role_id: req.body['LoginInfo']['AD_Role_ID'],
            ad_org_id: req.body['LoginInfo']['AD_Org_ID'],
            m_warehouse_id: req.body['LoginInfo']['M_Warehouse_ID']
        }
        
        var resultado = await requestWS( induvis.host, 'actualizar_tercero_ws', context, params)
        res.json({ exito: true, msg: resultado })

    } catch (e) {
        console.error(e)
        res.json({exito: false, msg: `${e}`})
    }
})

module.exports = router;