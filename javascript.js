package com.davivienda.piac.delegate.compartidos;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.net.InetAddress;
import java.net.URL;
import java.rmi.RemoteException;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.xml.datatype.DatatypeFactory;

import org.apache.commons.beanutils.BeanUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import com.davivienda.esquemas.framework.aplicaciontipo.v1.AplicacionTipo;
import com.davivienda.esquemas.framework.canaltipo.v1.CanalTipo;
import com.davivienda.esquemas.framework.consumidortipo.v1.ConsumidorTipo;
import com.davivienda.esquemas.framework.contextorespuestatipo.v1.ContextoRespuestaTipo;
import com.davivienda.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo;
import com.davivienda.esquemas.framework.operacioncanaltipo.v1.OperacionCanalTipo;
import com.davivienda.esquemas.framework.serviciotipo.v1.ServicioTipo;
import com.davivienda.esquemas.framework.terminaltipo.v1.TerminalTipo;
import com.davivienda.generarreporte.srvscngeneracionreporte.v1.ClienteType;
import com.davivienda.generarreporte.srvscngeneracionreporte.v1.MsjRespOpGeneracionReporte;
import com.davivienda.generarreporte.srvscngeneracionreporte.v1.MsjSolOpGeneracionReporte;
import com.davivienda.generarreporte.srvscngeneracionreporte.v1.Notificacion;
import com.davivienda.generarreporte.srvscngeneracionreporte.v1.PortSrvScnGeneracionReporteSOAP;
import com.davivienda.generarreporte.srvscngeneracionreporte.v1.ProductoType;
import com.davivienda.generarreporte.srvscngeneracionreporte.v1.ReporteType;
import com.davivienda.gestion.srvscngestioncache.v1.DataEscribirObjetoEnJson;
import com.davivienda.gestion.srvscngestioncache.v1.MsjRespOpEscribirObjetoEnJson;
import com.davivienda.gestion.srvscngestioncache.v1.MsjSolOpEscribirObjetoEnJson;
import com.davivienda.gestion.srvscngestioncache.v1.PortSrvScnGestionCacheSOAP;
import com.davivienda.gestion.srvscngestioncache.v1.SrvScnGestionCache;
import com.davivienda.notificaciones.srvscnnotificacionesmail.v1.MensajeTipo;
import com.davivienda.notificaciones.srvscnnotificacionesmail.v1.PlantillaTipo;
import com.davivienda.piac.api.common.vo.CrearPagareVo;
import com.davivienda.piac.api.common.vo.DocumentoPagareServiceTipoVo;
import com.davivienda.piac.api.common.vo.GeneracionDocsDesembolsoVo;
import com.davivienda.piac.api.common.vo.GenerarReporteVo;
import com.davivienda.piac.api.common.vo.ListaCrearGiradorVo;
import com.davivienda.piac.api.common.vo.ParametroVo;
import com.davivienda.piac.common.utils.FormatDateSlashed;
import com.davivienda.piac.common.utils.MapeadorDatosWs;
import com.davivienda.piac.common.utils.NumericFormat;
import com.davivienda.piac.common.utils.StringFormat;
import com.davivienda.piac.common.utils.UtilityFunctions;
import com.davivienda.piac.common.utils.Validadores;
import com.davivienda.piac.common.utils.XmlUtil;
import com.davivienda.piac.db.homologacion.main.MainDataBase;
import com.davivienda.piac.db.homologacion.model.HomologacionDto;
import com.davivienda.piac.delegate.LogTrxDelegate;
import com.davivienda.piac.delegate.compartidos.beans.ConsultaSalCorteHomologo;
import com.davivienda.piac.delegate.compartidos.beans.ConsultaSalProRespHomologo;
import com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.AdjuntoTipo;
import com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.Cliente;
import com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.MsjRespOpGenerarPaquete;
import com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.MsjSolOpGenerarPaquete;
import com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.Parametros;
import com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.PortSrvScnGeneracionPaqueteDocumentosSOAP;
import com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.V1;
import com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.Valor;
import com.davivienda.service.DataConsumidor;
import com.davivienda.service.DataOperacion;
import com.davivienda.service.DataResponseGenerarToken;
import com.davivienda.service.DataServicio;
import com.davivienda.service.RequestGenerarToken;
import com.davivienda.service.Response;
import com.davivienda.service.ResponseGenerarToken;
import com.davivienda.service.SrvScnGeneradorToken;
import com.davivienda.service.SrvScnGeneradorToken_Service;
import com.davivienda.srvscncrearpagaredigital.v1.ArchivoAdjuntoTipo;
import com.davivienda.srvscncrearpagaredigital.v1.CodigoDepositanteTipo;
import com.davivienda.srvscncrearpagaredigital.v1.CrearGiradorServiceTipo;
import com.davivienda.srvscncrearpagaredigital.v1.DatosSolicitud;
import com.davivienda.srvscncrearpagaredigital.v1.DocumentoPagareServiceTipo;
import com.davivienda.srvscncrearpagaredigital.v1.GiradorNaturalTipo;
import com.davivienda.srvscncrearpagaredigital.v1.InfoCertificadoFirmaTipo;
import com.davivienda.srvscncrearpagaredigital.v1.InformacionFirmarPagareTipo;
import com.davivienda.srvscncrearpagaredigital.v1.MsjSolOpCrearPagareDigital;
import com.davivienda.srvscncrearpagaredigital.v1.PortSrvScnOperacionesPagareSOAP;
import com.davivienda.srvscngenerardocumentodesembolso.v1.Columna;
import com.davivienda.srvscngenerardocumentodesembolso.v1.ConsultaPagareServiceTipo;
import com.davivienda.srvscngenerardocumentodesembolso.v1.MsjRespOpGenerarDocumentoDesembolso;
import com.davivienda.srvscngenerardocumentodesembolso.v1.MsjSolOpGenerarDocumentoDesembolso;
import com.davivienda.srvscngenerardocumentodesembolso.v1.ParametroTabla;
import com.davivienda.srvscngenerardocumentodesembolso.v1.PortSrvScnGenerarDocumentoDesembolsoSOAP;
import com.davivienda.srvscngenerardocumentodesembolso.v1.ProductoTipo;
import com.davivienda.srvscngenerardocumentodesembolso.v1.Registro;
import com.davivienda.srvscngenerardocumentodesembolso.v1.Registros;
import com.davivienda.srvscngenerardocumentodesembolso.v1.SolOpConsultarPagare;
import com.davivienda.srvscngenerardocumentodesembolso.v1.SolOpGenerarPaquete;
import com.davivienda.xml.aperturacuentaahorros.AperturaCuentaAhorrosHTTPService;
import com.davivienda.xml.aperturacuentaahorros.AperturaCuentaAhorrosPortType;
import com.davivienda.xml.aperturacuentaahorros.RequestaperturaCuentaAhorrosType;
import com.davivienda.xml.aperturacuentaahorros.ResponseaperturaCuentaAhorrosType;
import com.davivienda.xml.asignarmedioprocesoexpress.AsignarMedioProcesoExpressHTTPService;
import com.davivienda.xml.asignarmedioprocesoexpress.AsignarMedioProcesoExpressPortType;
import com.davivienda.xml.asignarmedioprocesoexpress.ClienteRequestType;
import com.davivienda.xml.asignarmedioprocesoexpress.DataReqType;
import com.davivienda.xml.asignarmedioprocesoexpress.RequestAsignarMedioProcesoExpressType;
import com.davivienda.xml.asignarmedioprocesoexpress.ResponseAsignarMedioProcesoExpressType;
import com.davivienda.xml.asignarmedioprocesoexpress.TarjetaRequestType;
import com.davivienda.xml.consultapersistenciacredito.ConsultaPersistenciaCreditoMsgSetPortType;
import com.davivienda.xml.consultapersistenciacredito.ConsultaPersistenciaCreditoSOAPHTTPService;
import com.davivienda.xml.consultapersistenciacredito.RequetsConsultarPersistenciaType;
import com.davivienda.xml.consultapersistenciacredito.ResponseConsultarPersistenciaType;
import com.davivienda.xml.consultargirodirectoxid.ConsultarGiroDirectoXId;
import com.davivienda.xml.consultargirodirectoxid.ConsultarGiroDirectoXIdHTTPService;
import com.davivienda.xml.consultargirodirectoxid.RequestconsultarGiroDirectoXIdType;
import com.davivienda.xml.consultargirodirectoxid.ResponseconsultarGiroDirectoXIdType;
import com.davivienda.xml.consultasaldoscorte.ConsultaSaldosCorteMsgSetPortType;
import com.davivienda.xml.consultasaldoscorte.ConsultaSaldosCorteSOAPHTTPService;
import com.davivienda.xml.consultasaldoscorte.DataHeaderType;
import com.davivienda.xml.consultasaldoscorte.DataRespType;
import com.davivienda.xml.consultasaldoscorte.DataType;
import com.davivienda.xml.consultasaldoscorte.RequetsType;
import com.davivienda.xml.consultassaldospromedio.ConsultaSaldosPromedioMsgSetPortType;
import com.davivienda.xml.consultassaldospromedio.ConsultaSaldosPromedioSOAPHTTPService;
import com.davivienda.xml.consultassaldospromedio.Data;
import com.davivienda.xml.consultassaldospromedio.DataHeader;
import com.davivienda.xml.consultassaldospromedio.DataResp;
import com.davivienda.xml.consultassaldospromedio.RequestType;
import com.davivienda.xml.eliminacionpersistenciacredito.EliminacionPersistenciaCreditoMsgSetPortType;
import com.davivienda.xml.eliminacionpersistenciacredito.EliminacionPersistenciaCreditoSOAPHTTPService;
import com.davivienda.xml.eliminacionpersistenciacredito.RequetsEliminarPersistenciaType;
import com.davivienda.xml.eliminacionpersistenciacredito.ResponseEliminarPersistenciaType;
import com.davivienda.xml.validacionespreviasexpressdigital.CamposDisponiblesRequestType;
import com.davivienda.xml.validacionespreviasexpressdigital.InfoClienteRequestType;
import com.davivienda.xml.validacionespreviasexpressdigital.InfoProcesoRequestType;
import com.davivienda.xml.validacionespreviasexpressdigital.RequestValidacionesPreviasType;
import com.davivienda.xml.validacionespreviasexpressdigital.ResponseValidacionesPreviasType;
import com.davivienda.xml.validacionespreviasexpressdigital.ValidacionesPreviasExpressDigitalHTTPService;
import com.davivienda.xml.validacionespreviasexpressdigital.ValidacionesPreviasExpressDigitalPortType;
import com.itextpdf.xmp.impl.Base64;
import com.sun.xml.ws.client.BindingProviderProperties;
import com.sun.xml.ws.developer.WSBindingProvider;


public class WebServiceClientsDelegate {
	private static Logger logger=LoggerFactory.getLogger(WebServiceClientsDelegate.class);
	private static WebServiceClientsDelegate instance=null;
	private static final String QUERY_REQUEST = "-Query-Request";
	private static final String QUERY_RESPONSE = "-Query-Response";
	private static final String TOTAL = "total:";
	private static final String JORNADA = ",jornada:";
	private static final String CANAL = ",canal:";
	private static final String PERFIL = ",perfil:";
	private static final String VERSION = ",version:";
	private static final String IDTRANSACCION = ",idTransacion:";
	private static final String CACEPTACION = ",cAceptacion:";
	private static final String ULTMSG= ",ultMsg:";
	private static final String CODRESPUESTA = ",codRespuesta:";
	private static final short CODMSGRESPUESTA_OK = 0;
	private static final String CODMSGRESPUESTA_ERRORSERVICIO = "5";
	private static final String CARACTERACEPTACION_PORBIEN = "B";
	private static final String CARACTERACEPTACION_PORMAL = "M";
	private String timeoutDef;
	private String timeout;
	
	/**
	 * Constructor
	 *
	 */
	private WebServiceClientsDelegate(){
		timeoutDef = obtenerValorHomologado("default",353);
	}
	
	/**
	 * Retorna unica instancia del objeto
	 * @return ConfiguracionNoPresencial
	 */
	public static synchronized WebServiceClientsDelegate getInstance(){
		if (instance==null)
			instance=new WebServiceClientsDelegate();
		return instance;
	}
	
	public Map<String,Object> consultarGiroDirecto(Map<String,Object> datosServicio, StringBuilder logEntry) {
		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		if(logger.isDebugEnabled()){
			writeDebug(logEntry, StringFormat.trim(datosServicio.get("rowId")), "[RowId: " + datosServicio.get("rowId") + "] Parametros:"
					+" fechaInicio: "+datosServicio.get("fecInicio")
					+" fechaFin: "+datosServicio.get("fecFin")
					+" numIdentificacion: "+datosServicio.get("numIdentificacion")
					+" valTipoIdentificacion: "+datosServicio.get("valTipoIdentificacion"));
		}
		Map<String,Object> mapaRetorno = new HashMap<String,Object>();
		
		
		try {
			//Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");
			String wsdl = datosServicio.get("ws.endpoint").toString();
			ConsultarGiroDirectoXIdHTTPService clienteWS = new ConsultarGiroDirectoXIdHTTPService(new URL(StringFormat.trim(wsdl)));
			ConsultarGiroDirectoXId port = clienteWS.getConsultarGiroDirectoXIdSOAPHTTPPort();
            setTimeOut(port);
			RequestconsultarGiroDirectoXIdType requestGiroDirecto = new RequestconsultarGiroDirectoXIdType();
			com.davivienda.xml.consultargirodirectoxid.DataHeaderReqType dataHeaderReqType = new com.davivienda.xml.consultargirodirectoxid.DataHeaderReqType();
			dataHeaderReqType.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeaderReqType.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeaderReqType.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeaderReqType.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeaderReqType.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeaderReqType.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeaderReqType.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeaderReqType.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataHeaderReqType.setIdTransaccion(StringFormat.trim(datosServicio.get("rowId")));
			requestGiroDirecto.setDataHeader(dataHeaderReqType);
			com.davivienda.xml.consultargirodirectoxid.DataReqType dataReqType = new com.davivienda.xml.consultargirodirectoxid.DataReqType();
			dataReqType.setFecInicio(NumericFormat.parseInteger(datosServicio.get("fechaInicio")));
			dataReqType.setFecFin(NumericFormat.parseInteger(datosServicio.get("fechaFin")));
			// dataReqType.setNumGiro(null);
			dataReqType.setNumIdentificacion(StringFormat.trim(datosServicio.get("numIdentificacion")));
			dataReqType.setValTipoIdentificacion(NumericFormat.parseShort(datosServicio.get("valTipoIdentificacion")));
			requestGiroDirecto.setData(dataReqType);
		
		
			String cuerpo =   TOTAL + StringFormat.trim(datosServicio.get("Total"))
							+ JORNADA + StringFormat.trim(datosServicio.get("Jornada"))
							+ CANAL + StringFormat.trim(datosServicio.get("Canal"))
							+ PERFIL + StringFormat.trim(datosServicio.get("Perfil"))
							+ VERSION + StringFormat.trim(datosServicio.get("VersionServicio"));
		
		
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(datosServicio.get("rowId")), StringFormat.trim(datosServicio.get("Usuario")), "", "", StringFormat.trim(datosServicio.get("NombreOperacion")) + QUERY_REQUEST , cuerpo);
		
			ResponseconsultarGiroDirectoXIdType respuesta = port.consultarGiroDirectoXId(requestGiroDirecto);
			if(respuesta != null){
				if(respuesta.getData() != null){			
					mapaRetorno = MapeadorDatosWs.retornaValoresWS(respuesta.getData());
				}
				if(respuesta.getDataHeader() != null)
					mapaRetorno.putAll(MapeadorDatosWs.retornaValoresWS(respuesta.getDataHeader()));
			}
		
			cuerpo =  TOTAL + StringFormat.trim(mapaRetorno.get("total")) 
					+ CACEPTACION + StringFormat.trim(mapaRetorno.get("caracterAceptacion"))
					+ ULTMSG + StringFormat.trim(mapaRetorno.get("ultimoMensaje"))
					+ CODRESPUESTA + StringFormat.trim(mapaRetorno.get("codMsgRespuesta"));
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(mapaRetorno.get("rowId")), "", "", "", StringFormat.trim(mapaRetorno.get("nombreOperacion")) + QUERY_RESPONSE , cuerpo);
		} catch (Exception e) {
			mapaRetorno.put("codMsgRespuesta", "5");
			mapaRetorno.put("msgRespuesta", "Ha ocurrido un error inesperado.");
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);
		}
		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		
		return mapaRetorno;
			
    }
	
	
	public Map<String, Object> consultaSaldosPromedios(Map<String, Object> datosServicio, StringBuilder logEntry) {
		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		if(logger.isDebugEnabled()){
			writeDebug(logEntry, StringFormat.trim(datosServicio.get("rowId")), "[RowId: " + datosServicio.get("rowId") + "] Parametros:"
					+" valNumeroIdentificacion: "+datosServicio.get("valNumeroIdentificacion")
					+" valTipoIdentificacion: "+datosServicio.get("valTipoIdentificacion")
					+" valTipoProducto: "+datosServicio.get("valTipoProducto")
					+" valNumeroProducto: "+datosServicio.get("valNumeroProducto")
					+" valCompania: "+datosServicio.get("valCompania"));
		}
		Map<String,Object> mapaRetorno = new HashMap<String,Object>();
		
		
		try {
			//Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");
			//String wsdl ="http://192.168.40.206:80/ESBService/ConsultaSaldosPromedio?wsdl";
			String wsdl = datosServicio.get("ws.endpoint").toString();
			ConsultaSaldosPromedioSOAPHTTPService clienteWS = new ConsultaSaldosPromedioSOAPHTTPService(new URL(StringFormat.trim(wsdl)));
			ConsultaSaldosPromedioMsgSetPortType port = clienteWS.getConsultaSaldosPromedioSOAPHTTPPort();
            setTimeOut(port);
			RequestType requestType = new RequestType();
			
			DataHeader dataHeaderReqType = new DataHeader();
			dataHeaderReqType.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeaderReqType.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeaderReqType.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeaderReqType.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeaderReqType.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeaderReqType.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeaderReqType.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeaderReqType.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataHeaderReqType.setIdTransaccion(StringFormat.trim(datosServicio.get("rowId")));
			
			requestType.setDataHeader(dataHeaderReqType);
			
			Data dataReqType = new Data();
			dataReqType.setValNumeroIdentificacion(StringFormat.trim(datosServicio.get("valNumeroIdentificacion")));
			dataReqType.setValCompania(StringFormat.trim(datosServicio.get("valCompania")));
			dataReqType.setValTipoProducto(StringFormat.trim(datosServicio.get("valTipoProducto")));
			dataReqType.setValNumeroProducto(StringFormat.trim(datosServicio.get("valNumeroProducto")));
			dataReqType.setValTipoIdentificacion(StringFormat.trim(datosServicio.get("valTipoIdentificacion")));
			requestType.setData(dataReqType);
		
		
			String cuerpo =   TOTAL + StringFormat.trim(datosServicio.get("Total"))
							+ JORNADA + StringFormat.trim(datosServicio.get("Jornada"))
							+ CANAL + StringFormat.trim(datosServicio.get("Canal"))
							+ PERFIL + StringFormat.trim(datosServicio.get("Perfil"))
							+ VERSION + StringFormat.trim(datosServicio.get("VersionServicio"));
		
		
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(datosServicio.get("rowId")), StringFormat.trim(datosServicio.get("Usuario")), "", "", StringFormat.trim(datosServicio.get("NombreOperacion")) + QUERY_REQUEST , cuerpo);
		
			com.davivienda.xml.consultassaldospromedio.ResponseType respuesta = port.consultaSaldosPromedio(requestType);
						
			if(respuesta != null){
				if(respuesta.getData() != null){		
					ConsultaSalProRespHomologo consultaHomologos = getRegistrosHomologadosConSaldosPromed(respuesta.getData());
					mapaRetorno = MapeadorDatosWs.retornaValoresWS(consultaHomologos);
					mapaRetorno.put("PromedioDepositos", consultaHomologos.obtenerPromedioDepositos());
					mapaRetorno.put("PromedioRetiros", consultaHomologos.obtenerPromedioRetiros());
					mapaRetorno.put("PromedioSaldosP", consultaHomologos.obtenerPromedioSaldosP());
				}
				if(respuesta.getDataHeader() != null)
					mapaRetorno.putAll(MapeadorDatosWs.retornaValoresWS(respuesta.getDataHeader()));
			}
		
			cuerpo =  TOTAL + StringFormat.trim(mapaRetorno.get("total")) 
					+ CACEPTACION + StringFormat.trim(mapaRetorno.get("caracterAceptacion"))
					+ ULTMSG + StringFormat.trim(mapaRetorno.get("ultimoMensaje"))
					+ CODRESPUESTA + StringFormat.trim(mapaRetorno.get("codMsgRespuesta"));
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(mapaRetorno.get("rowId")), "", "", "", StringFormat.trim(mapaRetorno.get("nombreOperacion")) + QUERY_RESPONSE , cuerpo);
		}  catch (Exception e) {
			mapaRetorno.put("codMsgRespuesta", "5");
			mapaRetorno.put("msgRespuesta", "Ha ocurrido un error inesperado.");
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);
		}
		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		return mapaRetorno;
	}
	
	public Map<String, Object> consultaSaldosCorte(Map<String, Object> datosServicio, StringBuilder logEntry) {
		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		if(logger.isDebugEnabled()){
			writeDebug(logEntry, StringFormat.trim(datosServicio.get("rowId")), "[RowId: " + datosServicio.get("rowId") + "] Parametros:"
					+" valNumeroIdentificacion: "+datosServicio.get("valNumeroIdentificacion")
					+" valTipoIdentificacion: "+datosServicio.get("valTipoIdentificacion")
					+" valTipoProducto: "+datosServicio.get("valTipoProducto")
					+" valNumeroProducto: "+datosServicio.get("valNumeroProducto")
					+" valCompania: "+datosServicio.get("valCompania"));
		}
		Map<String,Object> mapaRetorno = new HashMap<String,Object>();				
		try {
			//Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");
			String wsdl = datosServicio.get("ws.endpoint").toString();
			ConsultaSaldosCorteSOAPHTTPService clienteWS = new ConsultaSaldosCorteSOAPHTTPService(new URL(StringFormat.trim(wsdl)));
			ConsultaSaldosCorteMsgSetPortType port = clienteWS.getConsultaSaldosCorteSOAPHTTPPort();
            setTimeOut(port);
			RequetsType requestType = new RequetsType();
			
			DataHeaderType dataHeaderReqType = new DataHeaderType();
			dataHeaderReqType.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeaderReqType.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeaderReqType.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeaderReqType.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeaderReqType.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeaderReqType.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeaderReqType.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeaderReqType.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataHeaderReqType.setIdTransaccion(StringFormat.trim(datosServicio.get("rowId")));
			
			requestType.setDataHeader(dataHeaderReqType);
			
			DataType dataReqType = new DataType();
			dataReqType.setValNumeroIdentificacion(StringFormat.trim(datosServicio.get("valNumeroIdentificacion")));
			dataReqType.setValCompania(StringFormat.trim(datosServicio.get("valCompania")));
			dataReqType.setValTipoProducto(StringFormat.trim(datosServicio.get("valTipoProducto")));
			dataReqType.setValNumeroProducto(StringFormat.trim(datosServicio.get("valNumeroProducto")));
			dataReqType.setValTipoIdentificacion(StringFormat.trim(datosServicio.get("valTipoIdentificacion")));
			requestType.setData(dataReqType);

			String cuerpo =   TOTAL + StringFormat.trim(datosServicio.get("Total"))
							+ JORNADA + StringFormat.trim(datosServicio.get("Jornada"))
							+ CANAL + StringFormat.trim(datosServicio.get("Canal"))
							+ PERFIL + StringFormat.trim(datosServicio.get("Perfil"))
							+ VERSION + StringFormat.trim(datosServicio.get("VersionServicio"));
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(datosServicio.get("rowId")), StringFormat.trim(datosServicio.get("Usuario")), "", "", StringFormat.trim(datosServicio.get("NombreOperacion")) + QUERY_REQUEST , cuerpo);
		
			com.davivienda.xml.consultasaldoscorte.ResponseType respuesta = port.consultaSaldosCorte(requestType);
			if(respuesta != null){
				if(respuesta.getData() != null){
					ConsultaSalCorteHomologo consultaHomologos = getRegistrosHomologadosConSaldosCorte(respuesta.getData());
					mapaRetorno = MapeadorDatosWs.retornaValoresWS(consultaHomologos);
					mapaRetorno.put("promedioMinimo", consultaHomologos.obtenerPromedioMinimoCorte());
					mapaRetorno.put("promedioCorte", consultaHomologos.obtenerPromedioCorte());
				}
				if(respuesta.getDataHeader() != null)
					mapaRetorno.putAll(MapeadorDatosWs.retornaValoresWS(respuesta.getDataHeader()));
			}
			cuerpo =  TOTAL + StringFormat.trim(mapaRetorno.get("total")) 
					+ CACEPTACION + StringFormat.trim(mapaRetorno.get("caracterAceptacion"))
					+ ULTMSG + StringFormat.trim(mapaRetorno.get("ultimoMensaje"))
					+ CODRESPUESTA + StringFormat.trim(mapaRetorno.get("codMsgRespuesta"));
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(mapaRetorno.get("rowId")), "", "", "", StringFormat.trim(mapaRetorno.get("nombreOperacion")) + QUERY_RESPONSE , cuerpo);
		} catch (Exception e) {
			mapaRetorno.put("codMsgRespuesta", "5");
			mapaRetorno.put("msgRespuesta", "Ha ocurrido un error inesperado.");
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);
		}
		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		return mapaRetorno;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> generacionDocumentos(Map<String, Object> datosServicio, StringBuilder logEntry) {
		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		if(logger.isDebugEnabled()){ 
			writeDebug(logEntry, StringFormat.trim(datosServicio.get("rowId")), "[RowId: " + datosServicio.get("idTransaccion") + "] Parametros:"
					+" idTransaccion: "+datosServicio.get("idTransaccion")
					+" ws.dataHeader.idServicio: "+datosServicio.get("idServicio"));
		}
		
		String input = null;
		String output = null;
		
		Map<String,Object> mapaRetorno = new HashMap<String,Object>();				
		try {
			//Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");
			String wsdl = datosServicio.get("ws.endpoint").toString();
			V1 clienteWS = new V1(new URL(StringFormat.trim(wsdl)));
			PortSrvScnGeneracionPaqueteDocumentosSOAP port = clienteWS.getPortSrvScnGeneracionPaqueteDocumentosSOAP();
            setTimeOut(port);
			MsjSolOpGenerarPaquete requestType = new MsjSolOpGenerarPaquete();
						
			com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo contexto = new com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo();
			
			com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.serviciotipo.v1.ServicioTipo servicio = new com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.serviciotipo.v1.ServicioTipo();
			servicio.setIdServicio(datosServicio.get("idServicio").toString());

			com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.operacioncanaltipo.v1.OperacionCanalTipo operacionCanal = new com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.operacioncanaltipo.v1.OperacionCanalTipo();
			operacionCanal.setIdSesion(datosServicio.get("idSesion").toString());
			operacionCanal.setIdTransaccion(datosServicio.get("idTransaccion").toString());
			GregorianCalendar gc = new GregorianCalendar();
			gc.setTime(new Date());
			
			operacionCanal.setFecOperacion(DatatypeFactory.newInstance().newXMLGregorianCalendar(gc));

			operacionCanal.setValJornada(datosServicio.get("Jornada").toString());
			operacionCanal.setCodMoneda(datosServicio.get("CodMoneda").toString());
			operacionCanal.setCodPais(datosServicio.get("CodPais").toString());
			operacionCanal.setCodIdioma(datosServicio.get("CodIdioma").toString());

			com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.consumidortipo.v1.ConsumidorTipo consumidor = new com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.consumidortipo.v1.ConsumidorTipo();
			consumidor.setIdConsumidor(datosServicio.get("IdCosumidor").toString());

			com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.aplicaciontipo.v1.AplicacionTipo aplicacion = new com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.aplicaciontipo.v1.AplicacionTipo();
			aplicacion.setIdAplicacion(datosServicio.get("IdAplicacion").toString());
						
			consumidor.setAplicacion(aplicacion);
		
			com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.canaltipo.v1.CanalTipo canal = new com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.canaltipo.v1.CanalTipo();
			canal.setIdCanal(Short.parseShort(datosServicio.get("Canal").toString()));
			canal.setIdHost(datosServicio.get("IdHost").toString());
			
			consumidor.setCanal(canal);
			
			com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.terminaltipo.v1.TerminalTipo terminal = new com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.terminaltipo.v1.TerminalTipo();
			terminal.setIdTerminal(Integer.parseInt(datosServicio.get("IdTerminal").toString()));
			terminal.setValOrigenPeticion(datosServicio.get("Total").toString());
			terminal.setCodUsuario(datosServicio.get("CodUsuario").toString());
			terminal.setValPerfil(datosServicio.get("Perfil").toString());

			consumidor.setTerminal(terminal);
			
			contexto.setCriteriosOrdenamiento(new com.davivienda.rsa.srvscngeneracionpaquetedocumentos.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo.CriteriosOrdenamiento());
			
			contexto.setServicio(servicio);
			contexto.setOperacionCanal(operacionCanal);
			contexto.setConsumidor(consumidor);
			requestType.setContextoSolicitud(contexto);
			requestType.setPaqueteDocId(datosServicio.get("paqueteDocId").toString());
			
			Cliente cliente = new Cliente();
			cliente.setValTipoIdentificacion(datosServicio.get("cliente-valTipoIdentificacion").toString());
			cliente.setValNumeroIdentificacion(datosServicio.get("cliente-valNumeroIdentificacion").toString());
			cliente.setValMail(datosServicio.get("cliente-valMail").toString());
			
			requestType.setCliente(cliente);
			requestType.setEnviarCopiaCorreo(Boolean.parseBoolean(datosServicio.get("enviarCopiaCorreo").toString()));
			requestType.setRequiereClave(Boolean.parseBoolean(datosServicio.get("requiereClave").toString()));
			requestType.setValClaveDocumento(datosServicio.get("valClaveDocumento").toString());

			Parametros parametros = new Parametros();
			parametros.getValParametro().addAll((List<Valor>) datosServicio.get("listaParametros"));
			parametros.getAdjunto().addAll((List<AdjuntoTipo>) datosServicio.get("listaAdjuntos"));
			requestType.setListaParametros(parametros);

			String cuerpo =   TOTAL + StringFormat.trim(datosServicio.get("Total"))
							+ JORNADA + StringFormat.trim(datosServicio.get("Jornada"))
							+ CANAL + StringFormat.trim(datosServicio.get("Canal"))
							+ PERFIL + StringFormat.trim(datosServicio.get("Perfil"))
							+ VERSION + StringFormat.trim(datosServicio.get("VersionServicio"));
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(datosServicio.get("rowId")), StringFormat.trim(datosServicio.get("Usuario")), "", "", StringFormat.trim(datosServicio.get("NombreOperacion")) + QUERY_REQUEST , cuerpo);

			input = XmlUtil.convertObjectToXmlWithoutRootElement(requestType, false);
			
			MsjRespOpGenerarPaquete respuesta = port.opGenerarPaquete(requestType);
			
			output = XmlUtil.convertObjectToXmlWithoutRootElement(respuesta, false);
			
			if(respuesta != null){
				if(respuesta.getContextoRespuesta()!= null && respuesta.getContextoRespuesta().getResultadoTransaccion()!= null ){
					mapaRetorno = MapeadorDatosWs.retornaValoresWS(respuesta.getContextoRespuesta().getResultadoTransaccion());
				}
			}
			cuerpo =  TOTAL + StringFormat.trim(mapaRetorno.get("total")) 
					+ CACEPTACION + StringFormat.trim(mapaRetorno.get("caracterAceptacion"))
					+ ULTMSG + StringFormat.trim(mapaRetorno.get("ultimoMensaje"))
					+ CODRESPUESTA + StringFormat.trim(mapaRetorno.get("codMsgRespuesta"));
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(mapaRetorno.get("rowId")), "", "", "", StringFormat.trim(mapaRetorno.get("nombreOperacion")) + QUERY_RESPONSE , cuerpo);
		} catch (Exception e) {
			mapaRetorno.put("codMsgRespuesta", "5");
			mapaRetorno.put("msgRespuesta", "Ha ocurrido un error inesperado.");
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);
		} finally {
			
			try {
				MainDataBase.getInstance().guardarTrazaVentaLinea(StringFormat.trim(datosServicio.get("idTransaccion")), StringFormat.trim(datosServicio.get("Usuario")), "generacionDocumentos", input, output);
			} catch (Exception e) {
				UtilityFunctions.writeError("No pudo guardar en BD la traza venta linea", e, new HashMap<String, Object>(), logger);
			}
			
		}
		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		return mapaRetorno;
	}
	
	public Map<String, Object> srvScnGeneradorToken(Map<String, Object> datosServicio, StringBuilder logEntry) {

		String rowId = StringFormat.trim(datosServicio.get("rowId"));

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {

			// Configuracion propia del webservice
			//String wsdl = StringFormat.trim(datosServicio.get("ws.endpoint")).concat("?wsdl");			
			String wsdl = datosServicio.get("ws.endpoint").toString();
			SrvScnGeneradorToken_Service clienteWs = new SrvScnGeneradorToken_Service(new URL(wsdl));
			SrvScnGeneradorToken port = clienteWs.getSrvScnGeneradorTokenPort();
            setTimeOut(port);
			RequestGenerarToken requestType = new RequestGenerarToken();
			com.davivienda.service.DataHeader dataHeaderReqType = new com.davivienda.service.DataHeader();
			
			//request - dataServicio
			DataServicio dataServicio = new DataServicio();
			dataServicio.setIdServicio(StringFormat.trim(datosServicio.get("idServicio")));
			dataServicio.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataServicio.setIdTransaccion(NumericFormat.parseLong(datosServicio.get("idTransaccion")));
			
			//request - dataOperacion
			DataOperacion dataOperacion = new DataOperacion();
			dataOperacion.setIdentificadorSesion(StringFormat.trim(datosServicio.get("identificadorSesion")));
			dataOperacion.setFechaOperacion(FormatDateSlashed.getXMLGregorianCalendarNow());
			dataOperacion.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataOperacion.setModoOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataOperacion.setTipoMoneda(StringFormat.trim(datosServicio.get("CodMoneda")));
			dataOperacion.setCodigoPais(StringFormat.trim(datosServicio.get("CodPais")));
			dataOperacion.setIdioma(StringFormat.trim(datosServicio.get("CodIdioma")));
			
			//request - dataConsumidor
			DataConsumidor dataConsumidor = new DataConsumidor();
			dataConsumidor.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataConsumidor.setHost(StringFormat.trim(datosServicio.get("IdHost")));
			dataConsumidor.setOrigenPeticion(StringFormat.trim(InetAddress.getLocalHost().getHostAddress()));
			dataConsumidor.setIdAplicacion(StringFormat.trim(datosServicio.get("IdAplicacion")));
			dataConsumidor.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataConsumidor.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataConsumidor.setPerfil(StringFormat.trim(datosServicio.get("Perfil")));
			
			// Data header
			dataHeaderReqType.setDataServicio(dataServicio);
			dataHeaderReqType.setDataOperacion(dataOperacion);
			dataHeaderReqType.setDataConsumidor(dataConsumidor);
					
			// Establecer datos del request
			requestType.setDataHeader(dataHeaderReqType);

			// Grabar log transaccional request
			UtilityFunctions.grabarLogTransaccionalRequest(rowId, dataHeaderReqType.getDataConsumidor().getTotal(), dataHeaderReqType.getDataOperacion().getJornada(),
					dataHeaderReqType.getDataConsumidor().getCanal(), NumericFormat.parseShort(dataHeaderReqType.getDataConsumidor().getPerfil()), dataHeaderReqType.getDataServicio().getVersionServicio(),
					dataHeaderReqType.getDataConsumidor().getUsuario(), "srvScnGeneradorToken");

			// Ejecutar servicio
			ResponseGenerarToken respuestaWs = port.generarToken(requestType);

			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			Response dataHeaderRespType = respuestaWs.getDataHeader();
			DataResponseGenerarToken dataRespType = respuestaWs.getDataRespuesta();

			if ("M".equals(dataHeaderRespType.getDataEstadoRespuesta().getCaracterAceptacion()) && !(dataHeaderRespType.getDataEstadoRespuesta().getCodigoMsgRespuesta().equals("0"))) {

				String msgRespuesta = StringFormat.trim(dataHeaderRespType.getDataEstadoRespuesta().getMsgRespuesta());

				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(msgRespuesta);
				UtilityFunctions.writeError(datosServicio, rowId, msgRespuesta, logger);

			} else if (dataRespType != null) {

				mapaRetorno.put("caracterAceptacion", StringFormat.trim(dataHeaderRespType.getDataEstadoRespuesta().getCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(dataHeaderRespType.getDataEstadoRespuesta().getCodigoMsgRespuesta()));
				mapaRetorno.put("token", dataRespType.getToken());

				// Grabar log transaccional response
				UtilityFunctions.grabarLogTransaccionalResponse(rowId, dataHeaderRespType.getDataConsumidorRespuesta().getTotal(),
						dataHeaderRespType.getDataEstadoRespuesta().getCaracterAceptacion(), NumericFormat.parseShort(dataHeaderRespType.getDataEstadoRespuesta().getUltimoMensaje()),
						 NumericFormat.parseShort(dataHeaderRespType.getDataEstadoRespuesta().getCodigoMsgRespuesta()), "srvScnGeneradorToken");

			} else {

				UtilityFunctions.writeInfo("La respuesta del servicio esta vaciá.", logger);

			}

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;

	}
	
	public Map<String, Object> srvScnGestionCache(Map<String, Object> datosServicio, StringBuilder logEntry) {

		String rowId = StringFormat.trim(datosServicio.get("rowId"));

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {

			// Configuracion propia del webservice
			//String wsdl = StringFormat.trim(datosServicio.get("ws.endpoint")).concat("?wsdl");			
			String wsdl = datosServicio.get("ws.endpoint").toString();
			SrvScnGestionCache clienteWs = new SrvScnGestionCache(new URL(wsdl));
			PortSrvScnGestionCacheSOAP port = clienteWs.getPortSrvScnGestionCacheSOAP();
            setTimeOut(port);
			MsjSolOpEscribirObjetoEnJson requestType = new MsjSolOpEscribirObjetoEnJson();
			ContextoSolicitudTipo dataHeaderReqType = new ContextoSolicitudTipo();
			DataEscribirObjetoEnJson dataReqType = new DataEscribirObjetoEnJson();
			
			//request - servicio

			ServicioTipo servicioTipo = new ServicioTipo();
			servicioTipo.setIdServicio(StringFormat.trim(datosServicio.get("idServicio")));
			
			//request - operacionCanal
			OperacionCanalTipo operacionCanalTipo = new OperacionCanalTipo();
			operacionCanalTipo.setIdSesion(StringFormat.trim(datosServicio.get("idSesion")));
			operacionCanalTipo.setIdTransaccion(StringFormat.trim(datosServicio.get("idTransaccion")));
			operacionCanalTipo.setFecOperacion(FormatDateSlashed.getXMLGregorianCalendarNow());
			operacionCanalTipo.setValJornada(StringFormat.trim(datosServicio.get("Jornada")));
			operacionCanalTipo.setCodMoneda(StringFormat.trim(datosServicio.get("CodMoneda")));
			operacionCanalTipo.setCodPais(StringFormat.trim(datosServicio.get("CodPais")));
			operacionCanalTipo.setCodIdioma(StringFormat.trim(datosServicio.get("CodIdioma")));
			
			//request - consumidor-aplicacion
			AplicacionTipo aplicacionTipo = new AplicacionTipo();
			aplicacionTipo.setIdAplicacion(StringFormat.trim(datosServicio.get("IdAplicacion")));
			
			//request - consumidor-canal
			CanalTipo canalTipo = new CanalTipo();
			canalTipo.setIdCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			canalTipo.setIdHost(StringFormat.trim(datosServicio.get("IdHost")));
						
			//request - consumidor-terminal
			TerminalTipo terminalTipo = new TerminalTipo();
			terminalTipo.setIdTerminal(NumericFormat.parseInteger(datosServicio.get("IdTerminal")));
			terminalTipo.setValOrigenPeticion(StringFormat.trim(InetAddress.getLocalHost().getHostAddress()));
			terminalTipo.setCodUsuario(StringFormat.trim((datosServicio.get("CodUsuario"))));
			terminalTipo.setValPerfil(StringFormat.trim(datosServicio.get("Perfil")));
			
			//request - consumidor
			ConsumidorTipo consumidorTipo = new ConsumidorTipo();
			consumidorTipo.setIdConsumidor(StringFormat.trim(datosServicio.get("IdCosumidor")));
			consumidorTipo.setAplicacion(aplicacionTipo);	
			consumidorTipo.setCanal(canalTipo);
			consumidorTipo.setTerminal(terminalTipo);
			
			// Data header
			dataHeaderReqType.setServicio(servicioTipo);
			dataHeaderReqType.setOperacionCanal(operacionCanalTipo);
			dataHeaderReqType.setConsumidor(consumidorTipo);
					
			//Data
			dataReqType.setNombreCache(StringFormat.trim(datosServicio.get("NombreCache")));
			dataReqType.setLlave(StringFormat.trim(datosServicio.get("llave")));
			dataReqType.setObjeto(StringFormat.trim(datosServicio.get("objeto")));
			
			// Establecer datos del request
			requestType.setContextoSolicitud(dataHeaderReqType);
			requestType.setData(dataReqType);
			
			// Ejecutar servicio
			MsjRespOpEscribirObjetoEnJson respuestaWs = port.opEscribirObjetoEnJson(requestType);

			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			ContextoRespuestaTipo dataHeaderRespType = respuestaWs.getContextoRespuesta();

			if ("M".equals(dataHeaderRespType.getResultadoTransaccion().getValCaracterAceptacion()) && !(dataHeaderRespType.getResultadoTransaccion().getValNumeroAprobacion().equals("0"))) {

				String msgRespuesta = StringFormat.trim(dataHeaderRespType.getError().getValMsjRespuesta());

				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(msgRespuesta);
				UtilityFunctions.writeError(datosServicio, rowId, msgRespuesta, logger);

			} else if (dataHeaderRespType != null) {

				mapaRetorno.put("caracterAceptacion", StringFormat.trim(dataHeaderRespType.getResultadoTransaccion().getValCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(dataHeaderRespType.getResultadoTransaccion().getValNumeroAprobacion()));
				mapaRetorno.put("resultadoTransaccion", dataHeaderRespType.getResultadoTransaccion());
				
			} else {

				UtilityFunctions.writeInfo("La respuesta del servicio esta vaciá.", logger);

			}

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;

	}
	
	public Map<String, Object> consultarPersistencia(Map<String, Object> datosServicio, StringBuilder logEntry) {

		String rowId = StringFormat.trim(datosServicio.get("rowId"));

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {

			// Configuracion propia del webservice
			//String wsdl = StringFormat.trim(datosServicio.get("ws.endpoint")).concat("?wsdl");			
			String wsdl = datosServicio.get("ws.endpoint").toString();
			ConsultaPersistenciaCreditoSOAPHTTPService clienteWs = new ConsultaPersistenciaCreditoSOAPHTTPService(new URL(wsdl));
			ConsultaPersistenciaCreditoMsgSetPortType port = clienteWs.getConsultaPersistenciaCreditoSOAPHTTPPort();
            setTimeOut(port);
			RequetsConsultarPersistenciaType requestType = new RequetsConsultarPersistenciaType();
			com.davivienda.xml.consultapersistenciacredito.DataHeaderType dataHeaderReqType = new com.davivienda.xml.consultapersistenciacredito.DataHeaderType();
			com.davivienda.xml.consultapersistenciacredito.DataType dataReqType = new com.davivienda.xml.consultapersistenciacredito.DataType();

			// Data header
			dataHeaderReqType.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeaderReqType.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeaderReqType.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeaderReqType.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeaderReqType.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeaderReqType.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeaderReqType.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeaderReqType.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataHeaderReqType.setIdTransaccion(StringFormat.trim(datosServicio.get("idTransaccion")));
			
			// Data
			dataReqType.setAplicacionOrigen(NumericFormat.parseInteger(datosServicio.get("aplicacionOrigen")));
			dataReqType.setIpOrigen(StringFormat.trim(InetAddress.getLocalHost().getHostAddress()));
			dataReqType.setTipoIdentificacion(NumericFormat.parseInteger(datosServicio.get("tipoIdentificacion")));
			dataReqType.setNroIdentificacion(NumericFormat.parseLong(datosServicio.get("nroIdentificacion")));
			dataReqType.setTipoConsulta(StringFormat.trim(datosServicio.get("tipoConsulta")));
			
			// Establecer datos del request
			requestType.setDataHeader(dataHeaderReqType);
			requestType.setData(dataReqType);

			// Grabar log transaccional request
			UtilityFunctions.grabarLogTransaccionalRequest(rowId, dataHeaderReqType.getTotal(), dataHeaderReqType.getJornada(),
					dataHeaderReqType.getCanal(), dataHeaderReqType.getPerfil(), dataHeaderReqType.getVersionServicio(),
					dataHeaderReqType.getUsuario(), "consultarPersistencia");

			// Ejecutar servicio
			ResponseConsultarPersistenciaType respuestaWs = port.consultaPersistenciaCredito(requestType);

			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			com.davivienda.xml.consultapersistenciacredito.DataHeaderRespType dataHeaderRespType = respuestaWs.getDataHeader();
			com.davivienda.xml.consultapersistenciacredito.DataRespType dataRespType = respuestaWs.getData();

			if ("M".equals(dataHeaderRespType.getCaracterAceptacion()) && !(0 == dataHeaderRespType.getCodMsgRespuesta())) {

				String msgRespuesta = StringFormat.trim(dataHeaderRespType.getMsgRespuesta());

				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(msgRespuesta);
				UtilityFunctions.writeError(datosServicio, rowId, msgRespuesta, logger);

			} else if (dataRespType != null) {

				mapaRetorno.put("caracterAceptacion", StringFormat.trim(dataHeaderRespType.getCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(dataHeaderRespType.getCodMsgRespuesta()));
				mapaRetorno.put("nroSolicitud", dataRespType.getNroSolicitud());
				mapaRetorno.put("nroProceso", dataRespType.getNroProceso());

				// Grabar log transaccional response
				UtilityFunctions.grabarLogTransaccionalResponse(rowId, dataHeaderRespType.getTotal(),
						dataHeaderRespType.getCaracterAceptacion(), dataHeaderRespType.getUltimoMensaje(),
						dataHeaderRespType.getCodMsgRespuesta(), dataHeaderRespType.getNombreOperacion());

			} else {

				UtilityFunctions.writeInfo("La respuesta del servicio esta vaciá.", logger);

			}

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;

	}
	
	public Map<String, Object> eliminarPersistencia(Map<String, Object> datosServicio, StringBuilder logEntry) {

		String rowId = StringFormat.trim(datosServicio.get("rowId"));

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {

			// Configuracion propia del webservice
			//String wsdl = StringFormat.trim(datosServicio.get("ws.endpoint")).concat("?wsdl");			
			String wsdl = datosServicio.get("ws.endpoint").toString();
			EliminacionPersistenciaCreditoSOAPHTTPService clienteWs = new EliminacionPersistenciaCreditoSOAPHTTPService(new URL(wsdl));
			EliminacionPersistenciaCreditoMsgSetPortType port = clienteWs.getEliminacionPersistenciaCreditoSOAPHTTPPort();
            setTimeOut(port);
			RequetsEliminarPersistenciaType requestType = new RequetsEliminarPersistenciaType();
			com.davivienda.xml.eliminacionpersistenciacredito.DataHeaderType dataHeaderReqType = new com.davivienda.xml.eliminacionpersistenciacredito.DataHeaderType();
			com.davivienda.xml.eliminacionpersistenciacredito.DataType dataReqType = new com.davivienda.xml.eliminacionpersistenciacredito.DataType();

			// Data header
			dataHeaderReqType.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeaderReqType.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeaderReqType.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeaderReqType.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeaderReqType.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeaderReqType.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeaderReqType.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeaderReqType.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataHeaderReqType.setIdTransaccion(StringFormat.trim(datosServicio.get("idTransaccion")));
			
			// Data
			dataReqType.setAplicacionOrigen(NumericFormat.parseInteger(datosServicio.get("aplicacionOrigen")));
			dataReqType.setIpOrigen(StringFormat.trim(InetAddress.getLocalHost().getHostAddress()));
			dataReqType.setTipoIdentificacion(NumericFormat.parseInteger(datosServicio.get("tipoIdentificacion")));
			dataReqType.setNroIdentificacion(NumericFormat.parseLong(datosServicio.get("nroIdentificacion")));
			dataReqType.setNroSolicitud(NumericFormat.parseLong(datosServicio.get("nroSolicitud")));
			
			// Establecer datos del request
			requestType.setDataHeader(dataHeaderReqType);
			requestType.setData(dataReqType);

			// Grabar log transaccional request
			UtilityFunctions.grabarLogTransaccionalRequest(rowId, dataHeaderReqType.getTotal(), dataHeaderReqType.getJornada(),
					dataHeaderReqType.getCanal(), dataHeaderReqType.getPerfil(), dataHeaderReqType.getVersionServicio(),
					dataHeaderReqType.getUsuario(), "eliminarPersistencia");

			// Ejecutar servicio
			ResponseEliminarPersistenciaType respuestaWs = port.eliminacionPersistenciaCredito(requestType);

			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			com.davivienda.xml.eliminacionpersistenciacredito.DataHeaderRespType dataHeaderRespType = respuestaWs.getDataHeader();
			
			if ("M".equals(dataHeaderRespType.getCaracterAceptacion()) && !(0 == dataHeaderRespType.getCodMsgRespuesta())) {

				String msgRespuesta = StringFormat.trim(dataHeaderRespType.getMsgRespuesta());

				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(msgRespuesta);
				UtilityFunctions.writeError(datosServicio, rowId, msgRespuesta, logger);

			} else if (dataHeaderRespType != null) {

				mapaRetorno.put("caracterAceptacion", StringFormat.trim(dataHeaderRespType.getCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(dataHeaderRespType.getCodMsgRespuesta()));
				
				// Grabar log transaccional response
				UtilityFunctions.grabarLogTransaccionalResponse(rowId, dataHeaderRespType.getTotal(),
						dataHeaderRespType.getCaracterAceptacion(), dataHeaderRespType.getUltimoMensaje(),
						dataHeaderRespType.getCodMsgRespuesta(), dataHeaderRespType.getNombreOperacion());

			} else {

				UtilityFunctions.writeInfo("La respuesta del servicio esta vaciá.", logger);

			}

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;

	}
	
	public Map<String, Object> validacionesPrevias(Map<String, Object> datosServicio, StringBuilder logEntry) {

		String rowId = StringFormat.trim(datosServicio.get("rowId"));

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		String input = null;
		String output = null;
		
		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {

			// Configuracion propia del webservice
			//String wsdl = StringFormat.trim(datosServicio.get("ws.endpoint")).concat("?wsdl");			
			String wsdl = datosServicio.get("ws.endpoint").toString();
			ValidacionesPreviasExpressDigitalHTTPService clienteWs = new ValidacionesPreviasExpressDigitalHTTPService(new URL(wsdl));
			ValidacionesPreviasExpressDigitalPortType port = clienteWs.getValidacionesPreviasExpressDigitalHTTPPort();
            setTimeOut(port);
			RequestValidacionesPreviasType requestType = new RequestValidacionesPreviasType();
			com.davivienda.xml.validacionespreviasexpressdigital.DataHeaderReqType dataHeaderReqType = new com.davivienda.xml.validacionespreviasexpressdigital.DataHeaderReqType();
			com.davivienda.xml.validacionespreviasexpressdigital.DataReqType dataReqType = new com.davivienda.xml.validacionespreviasexpressdigital.DataReqType();

			// Data header
			dataHeaderReqType.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeaderReqType.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeaderReqType.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeaderReqType.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeaderReqType.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeaderReqType.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeaderReqType.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeaderReqType.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataHeaderReqType.setIdTransaccion(StringFormat.trim(datosServicio.get("idTransaccion")));
						
			// Data
			dataReqType.setInfoProceso((InfoProcesoRequestType) datosServicio.get("infoProceso"));
			dataReqType.setInfoCliente((InfoClienteRequestType) datosServicio.get("infoCliente"));
			dataReqType.setCamposDisponibles((CamposDisponiblesRequestType) datosServicio.get("camposDisponibles"));
			
			// Establecer datos del request
			requestType.setDataHeader(dataHeaderReqType);
			requestType.setData(dataReqType);

			input = XmlUtil.convertObjectToXmlWithoutRootElement(requestType, false);
			
			// Grabar log transaccional request
			UtilityFunctions.grabarLogTransaccionalRequest(rowId, dataHeaderReqType.getTotal(), dataHeaderReqType.getJornada(),
					dataHeaderReqType.getCanal(), dataHeaderReqType.getPerfil(), dataHeaderReqType.getVersionServicio(),
					dataHeaderReqType.getUsuario(), "validacionesPrevias");

			// Ejecutar servicio
			ResponseValidacionesPreviasType respuestaWs = port.validacionesPreviasExpressDigital(requestType);

			output = XmlUtil.convertObjectToXmlWithoutRootElement(respuestaWs, false);
			
			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			com.davivienda.xml.validacionespreviasexpressdigital.DataHeaderResType dataHeaderRespType = respuestaWs.getDataHeader();
			com.davivienda.xml.validacionespreviasexpressdigital.DataResType dataRespType = respuestaWs.getData();

			if ("M".equals(dataHeaderRespType.getCaracterAceptacion()) && !(0 == dataHeaderRespType.getCodMsgRespuesta())) {

				String msgRespuesta = StringFormat.trim(dataHeaderRespType.getMsgRespuesta());

				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(msgRespuesta);
				UtilityFunctions.writeError(datosServicio, rowId, msgRespuesta, logger);

			} else if (dataRespType != null) {

				mapaRetorno.put("caracterAceptacion", StringFormat.trim(dataHeaderRespType.getCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(dataHeaderRespType.getCodMsgRespuesta()));
				mapaRetorno.put("camposFuturo", dataRespType.getCamposFuturo());
				
				// Grabar log transaccional response
				UtilityFunctions.grabarLogTransaccionalResponse(rowId, dataHeaderRespType.getTotal(),
						dataHeaderRespType.getCaracterAceptacion(), dataHeaderRespType.getUltimoMensaje(),
						NumericFormat.parseShort(dataHeaderRespType.getCodMsgRespuesta()), dataHeaderRespType.getNombreOperacion());

			} else {

				UtilityFunctions.writeInfo("La respuesta del servicio esta vaciá.", logger);

			}

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
		    writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		} finally {
			
			try {
				MainDataBase.getInstance().guardarTrazaVentaLinea(rowId, StringFormat.trim(datosServicio.get("Usuario")), "validacionesPrevias", input, output);
			} catch (Exception e) {
				UtilityFunctions.writeError("No pudo guardar en BD la traza venta linea", e, new HashMap<String, Object>(), logger);
			}
			
		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;

	}
	
	public Map<String, Object> crearPagare(Map<String, Object> datosServicio, CrearPagareVo data, StringBuilder logEntry) {
		
		String rowId = StringFormat.trim(datosServicio.get("rowId"));

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		String input = null;
		String output = null;
		
		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {

			// Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");			
//			String wsdl = "http://192.168.40.206:80/SrvScnCrearPagareDigital-war/v1?wsdl";
			String wsdl = datosServicio.get("ws.endpoint").toString();
			com.davivienda.srvscncrearpagaredigital.v1.V1 clienteWs = new com.davivienda.srvscncrearpagaredigital.v1.V1(new URL(wsdl));
			PortSrvScnOperacionesPagareSOAP port = clienteWs.getPortSrvScnOperacionesPagareSOAP();
            setTimeOut(port);
			MsjSolOpCrearPagareDigital requestType = new MsjSolOpCrearPagareDigital();
			com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo dataHeaderReqType = new com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo();
			DatosSolicitud dataReqType = new DatosSolicitud();

			// Data header
			
			com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.serviciotipo.v1.ServicioTipo servicio = new com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.serviciotipo.v1.ServicioTipo();
			
			servicio.setIdServicio((String)datosServicio.get("idServicio"));
			
			dataHeaderReqType.setServicio(servicio);
			
			com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.operacioncanaltipo.v1.OperacionCanalTipo operacion = new com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.operacioncanaltipo.v1.OperacionCanalTipo();
			
			operacion.setIdSesion(data.getSession());
			operacion.setIdTransaccion(FormatDateSlashed.fechaHoyformatYMDHMS());
			operacion.setFecOperacion(FormatDateSlashed.getXMLGregorianCalendarActual());
			operacion.setValJornada((String)datosServicio.get("valJornada"));
			operacion.setCodMoneda((String)datosServicio.get("codMoneda"));
			operacion.setCodPais((String)datosServicio.get("codPais"));
			operacion.setCodIdioma((String)datosServicio.get("codIdioma"));
			
			dataHeaderReqType.setOperacionCanal(operacion);
			
			com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.consumidortipo.v1.ConsumidorTipo consumidor = new com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.consumidortipo.v1.ConsumidorTipo();
			consumidor.setIdConsumidor((String)datosServicio.get("idConsumidor"));
			com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.aplicaciontipo.v1.AplicacionTipo aplicacion = new com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.aplicaciontipo.v1.AplicacionTipo();
			aplicacion.setIdAplicacion((String)datosServicio.get("idAplicacion"));
			consumidor.setAplicacion(aplicacion);
			com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.canaltipo.v1.CanalTipo canal = new com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.canaltipo.v1.CanalTipo();
			canal.setIdCanal(Short.parseShort((String)datosServicio.get("idCanal")));
			canal.setIdHost((String)datosServicio.get("rowId"));
			consumidor.setCanal(canal);
			com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.terminaltipo.v1.TerminalTipo terminal = new com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.terminaltipo.v1.TerminalTipo();
			terminal.setIdTerminal(0);
			terminal.setValOrigenPeticion(StringFormat.trim(InetAddress.getLocalHost().getHostAddress()));
			terminal.setCodUsuario((String)datosServicio.get("codUsuario"));
			terminal.setValPerfil((String)datosServicio.get("valPerfil"));
			consumidor.setTerminal(terminal);
			
			dataHeaderReqType.setCriteriosOrdenamiento(new com.davivienda.srvscncrearpagaredigital.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo.CriteriosOrdenamiento());
			dataHeaderReqType.setConsumidor(consumidor);
			
			CodigoDepositanteTipo codDep = new CodigoDepositanteTipo();
			codDep.setCodigoDepositante(51);
			dataReqType.setCodigoDepositante(codDep);

			
			CrearGiradorServiceTipo crearGiro = new CrearGiradorServiceTipo();
			
			for( ListaCrearGiradorVo crearGiroL   : data.getListaCrearGirador()) {
		
				crearGiro.setIdentificacionEmisor("8600343137");
				crearGiro.setFkIdClasePersona((short) 1);
				crearGiro.setFkIdTipoDocumento(crearGiroL.getFkIdTipoDocumento());
				crearGiro.setNumeroDocumento(crearGiroL.getNumeroDocumento());
				crearGiro.setCorreoElectronico(crearGiroL.getCorreoElectronico());
				crearGiro.setDireccion1PersonaGrupoPGP(crearGiroL.getDireccion1PersonaGrupo_PGP());
				crearGiro.setTelefono1PersonaGrupoPGP(crearGiroL.getTelefono1PersonaGrupo_PGP());
				
				GiradorNaturalTipo giradorNat = new GiradorNaturalTipo();
				giradorNat.setFkIdPaisExpedicionNat(NumericFormat.parseInteger(crearGiroL.getGiradorNaturalTipo().getFkIdPaisExpedicion_Nat()));
				giradorNat.setFkIdDepartamentoExpedicionNat(NumericFormat.parseShort(crearGiroL.getGiradorNaturalTipo().getFkIdDepartamentoExpedicion_Nat()));
				giradorNat.setFkIdCiudadExpedicionNat(NumericFormat.parseInteger(crearGiroL.getGiradorNaturalTipo().getFkIdCiudadExpedicion_Nat()));
				giradorNat.setFkIdPaisDomicilioNat(NumericFormat.parseInteger(crearGiroL.getGiradorNaturalTipo().getFkIdPaisDomicilio_Nat()));
				giradorNat.setFkIdDepartamentoDomicilioNat(NumericFormat.parseShort(crearGiroL.getGiradorNaturalTipo().getFkIdDepartamentoDomicilio_Nat()));
				giradorNat.setFkIdCiudadDomicilioNat(NumericFormat.parseInteger(crearGiroL.getGiradorNaturalTipo().getFkIdCiudadDomicilio_Nat()));
				giradorNat.setPrimerApellidoNat(crearGiroL.getGiradorNaturalTipo().getPrimerApellido_Nat());
				giradorNat.setSegundoApellidoNat(crearGiroL.getGiradorNaturalTipo().getSegundoApellido_Nat());
				giradorNat.setNombresNatNat(crearGiroL.getGiradorNaturalTipo().getNombresNat_Nat());
				giradorNat.setNumeroCelular(crearGiroL.getGiradorNaturalTipo().getNumeroCelular());
				
				crearGiro.setGiradorNaturalTipo(giradorNat);
				
				dataReqType.getListaCrearGiradors().add(crearGiro);
			
			}
			
			for(DocumentoPagareServiceTipoVo documento : data.getDocumentoPagareServiceTipo()){
				DocumentoPagareServiceTipo documentoPagar = new DocumentoPagareServiceTipo();
				
				documentoPagar.setCreditoReembolsableEn("2");
				documentoPagar.setIdClaseDefinicionDocumento(23l);
				documentoPagar.setIdDocumentoPagare(documento.getIdDocumentoPagare());
				documentoPagar.setNitEmisor("8600343137");
				documentoPagar.setOtorganteCuenta(0);
				documentoPagar.setOtorganteNumId(documento.getOtorganteNumId());
				documentoPagar.setOtorganteTipoId(documento.getOtorganteTipoId());
				documentoPagar.setTipoPagare(2);
				documentoPagar.setValorPesosDesembolso(new BigDecimal("0"));
				
				dataReqType.getDocumentoPagareServiceTipos().add(documentoPagar);
				
			}
			
			InformacionFirmarPagareTipo informacionFirPagare = new InformacionFirmarPagareTipo();
			
			informacionFirPagare.setOTPProcedimiento("0");
			InfoCertificadoFirmaTipo infoCerti = new InfoCertificadoFirmaTipo();
			infoCerti.setClave(data.getInformacionFirmarPagareTipo().getInfoCertificadoFirmaTipo().getClave());
//			infoCerti.setIdDocumentoPagare(0);
			infoCerti.setIdRolFirmante((short) 5);
			infoCerti.setNumeroDocumento(data.getInformacionFirmarPagareTipo().getInfoCertificadoFirmaTipo().getNumeroDocumento());
			infoCerti.setTipoDocumento(data.getInformacionFirmarPagareTipo().getInfoCertificadoFirmaTipo().getTipoDocumento());
						
			informacionFirPagare.setInfoCertificadoFirmaTipo(infoCerti);
			
			ArchivoAdjuntoTipo archivoAdj = new ArchivoAdjuntoTipo(); 
			
			archivoAdj.setNombreArchivo("huella_registrada.jpg");
			archivoAdj.setContenido(data.getInformacionFirmarPagareTipo().getArchivosAdjuntos().getContenido().getBytes());
			
			informacionFirPagare.getArchivosAdjuntos().add(archivoAdj);
			
			dataReqType.setInformacionFirmarPagareTipo(informacionFirPagare);
			
			// Establecer datos del request
			requestType.setContextoSolicitud(dataHeaderReqType);
			requestType.setData(dataReqType);

			input = XmlUtil.convertObjectToXmlWithoutRootElement(requestType, false);
			
			// Grabar log transaccional request
			UtilityFunctions.grabarLogTransaccionalRequest(rowId, 0, (short) 0,
					canal.getIdCanal(), (short) 0, "",
					StringFormat.trim(datosServicio.get("Usuario")), "validacionesPrevias");

			// Ejecutar servicio
			com.davivienda.srvscncrearpagaredigital.v1.MsjRespOpCrearPagareDigital respuestaWs = port.opCrearPagareDigital(requestType);

			output = XmlUtil.convertObjectToXmlWithoutRootElement(respuestaWs, false);
			
			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			
			if ("M".equals(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValCaracterAceptacion())) {
				
				String msgRespuesta = "Ha ocurrido un error en el servicio";
				try {
					msgRespuesta = respuestaWs.getContextoRespuesta().getError().getValMsjRespuesta();
				} catch (Exception e) {
					msgRespuesta = "Ha ocurrido un error en el servicio";
				}
				
				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(msgRespuesta);
				UtilityFunctions.writeError(datosServicio, rowId, msgRespuesta, logger);
	
			} else  {
	
				mapaRetorno.put("caracterAceptacion", StringFormat.trim(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValNumeroAprobacion()));
				mapaRetorno.put("idDocumentoPagare", respuestaWs.getRespuestaDocumentoPagareDaneServiceTipo().getListaRespuestas().get(0).getIdDocumentoPagare());
//				mapaRetorno.put("respDocumentoPagare", respuestaWs.getRespuestaDocumentoPagareDaneServiceTipo());
//				mapaRetorno.put("respFirmarPagares", respuestaWs.getRespuestaFirmarPagaresTipo());
				
				// Grabar log transaccional response
				UtilityFunctions.grabarLogTransaccionalRequest(rowId, 0, (short) 0,
						canal.getIdCanal(), (short) 0, "",
						StringFormat.trim(datosServicio.get("Usuario")), "validacionesPrevias");
	
			} 

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
			writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		} finally {
			
			try {
				MainDataBase.getInstance().guardarTrazaVentaLinea(rowId, StringFormat.trim(datosServicio.get("Usuario")), "crearPagare", input, output);
			} catch (Exception e) {
				UtilityFunctions.writeError("No pudo guardar en BD la traza venta linea", e, new HashMap<String, Object>(), logger);
			}
			
		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;
	}
	
	public Map<String, Object> asignarMedio(Map<String, Object> datosServicio, StringBuilder logEntry) {
		
		String rowId = StringFormat.trim(datosServicio.get("rowId"));

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		String input = null;
		String output = null;
		
		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {

			// Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");			
//			String wsdl = "http://192.168.40.206:80/ESBService/AsignarMedioProcesoExpress/V2?wsdl";
			String wsdl = datosServicio.get("ws.endpoint").toString();
			AsignarMedioProcesoExpressHTTPService clienteWs = new AsignarMedioProcesoExpressHTTPService(new URL(wsdl));
			AsignarMedioProcesoExpressPortType port = clienteWs.getAsignarMedioProcesoExpressSOAPHTTPPort();
            setTimeOut(port);
			RequestAsignarMedioProcesoExpressType requestType = new RequestAsignarMedioProcesoExpressType();
			com.davivienda.xml.asignarmedioprocesoexpress.DataHeaderReqType dataHeaderReqType = new com.davivienda.xml.asignarmedioprocesoexpress.DataHeaderReqType();
			DataReqType dataReqType = new DataReqType();

			// Data header
			
			dataHeaderReqType.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeaderReqType.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeaderReqType.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeaderReqType.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeaderReqType.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeaderReqType.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeaderReqType.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeaderReqType.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataHeaderReqType.setIdTransaccion(StringFormat.trim(datosServicio.get("rowId")));

			ClienteRequestType clienteR = new ClienteRequestType();
			
			clienteR.setCodTipoIdCliente((String)datosServicio.get("infoClien-codTipoIdCliente"));
			clienteR.setValDireccionCorreoElecronico((String)datosServicio.get("infoClien-valDireccionCorreoElecronico"));
			clienteR.setValIdCliente(NumericFormat.parseLong((String)datosServicio.get("infoClien-valIdCliente")));
			clienteR.setValNumeroCelular((String)datosServicio.get("infoClien-valNumeroCelular"));
			clienteR.setValPrimerApellido((String)datosServicio.get("infoClien-valPrimerApellido"));
			clienteR.setValPrimerNombre((String)datosServicio.get("infoClien-valPrimerNombre"));
			clienteR.setValSegundoApellido((String)datosServicio.get("infoClien-valSegundoApellido"));
			clienteR.setValSegundoNombre((String)datosServicio.get("infoClien-valSegundoNombre"));
			clienteR.setValTipoCliente((String)datosServicio.get("infoClien-valTipoCliente"));
						
			dataReqType.setInformacionCliente(clienteR);
			
			TarjetaRequestType tarjetaReq = new TarjetaRequestType();
			
			tarjetaReq.setCodigoConvenio((String)datosServicio.get("infoTarj-codigoConvenio"));
			tarjetaReq.setIndicadorGeneradorPlastico("CP");
			tarjetaReq.setCodOficina("000100000000000");
			tarjetaReq.setCodigoProducto("");
			tarjetaReq.setCupoTotalDecisor((String)datosServicio.get("infoTarj-cupoTotalDecisor"));
			tarjetaReq.setCupoTotalInmediato("0");
			tarjetaReq.setNumeroSolicitud((String)datosServicio.get("rowId"));
			tarjetaReq.setValOrigenTerminal("EXPRESS OFICINAS");

			tarjetaReq.setCodigoOficina(NumericFormat.parseInteger(datosServicio.get("infoTarj-codigoOficina")));
			tarjetaReq.setCodigoAgenteVendedor(NumericFormat.parseInteger(datosServicio.get("infoTarj-codigoAgenteVendedor")));
			tarjetaReq.setCiudadCorrespondencia((String)datosServicio.get("infoTarj-ciudadCorrespondencia"));
			tarjetaReq.setDireccionCorrespondencia((String)datosServicio.get("infoTarj-direccionCorrespondencia"));
			tarjetaReq.setModalidadExtractos("1");
			
			tarjetaReq.setUsoFuturo1(0l);
			tarjetaReq.setUsoFuturo2(0l);
			tarjetaReq.setUsoFuturo3("");
			tarjetaReq.setUsoFuturo4("");
			
			
			dataReqType.setInformacionTarjeta(tarjetaReq);
			// Grabar log transaccional request
			UtilityFunctions.grabarLogTransaccionalRequest(rowId, dataHeaderReqType.getTotal(), dataHeaderReqType.getJornada(),
					dataHeaderReqType.getCanal(), dataHeaderReqType.getPerfil(), dataHeaderReqType.getVersionServicio(),
					dataHeaderReqType.getUsuario(), "validacionesPrevias");

			requestType.setData(dataReqType);
			requestType.setDataHeader(dataHeaderReqType);
						
			input = XmlUtil.convertObjectToXmlWithoutRootElement(requestType, false);
			
			// Ejecutar servicio
			ResponseAsignarMedioProcesoExpressType respuestaWs = port.asignarMedioProcesoExpress(requestType);

			output = XmlUtil.convertObjectToXmlWithoutRootElement(respuestaWs, false);
			
			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			
			if ("M".equals(respuestaWs.getDataHeader().getCaracterAceptacion())) {
	
				String msgRespuesta = respuestaWs.getDataHeader().getMsgRespuesta();
	
				if (msgRespuesta == null) {
					msgRespuesta = "Ha ocurrido un error en el servicio";
				}
				
				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(msgRespuesta);
				UtilityFunctions.writeError(datosServicio, rowId, msgRespuesta, logger);
	
			} else  {
	
				mapaRetorno.put("caracterAceptacion", StringFormat.trim(respuestaWs.getDataHeader().getCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(respuestaWs.getDataHeader().getMsgRespuesta()));
				mapaRetorno.put("numeroDeTarjeta", StringFormat.getNormaPCIIn("TC",Long.toString(respuestaWs.getData().getNumeroDeTarjeta()), 16)); // ??

				// Grabar log transaccional request
				UtilityFunctions.grabarLogTransaccionalRequest(rowId, dataHeaderReqType.getTotal(), dataHeaderReqType.getJornada(),
						dataHeaderReqType.getCanal(), dataHeaderReqType.getPerfil(), dataHeaderReqType.getVersionServicio(),
						dataHeaderReqType.getUsuario(), "validacionesPrevias");
	
			} 

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
			writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		} finally {
			
			try {
				MainDataBase.getInstance().guardarTrazaVentaLinea(rowId, StringFormat.trim(datosServicio.get("Usuario")), "asignarMedio", input, output);
			} catch (Exception e) {
				UtilityFunctions.writeError("No pudo guardar en BD la traza venta linea", e, new HashMap<String, Object>(), logger);
			}
			
		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;
	}
	
	public Map<String, Object> generarDocsDesembolso(Map<String, Object> datosServicio, GeneracionDocsDesembolsoVo data, StringBuilder logEntry) {
		String rowId = StringFormat.trim(datosServicio.get("rowId"));

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		String input = null;
		String output = null;
		
		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {

			// Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");			
//			String wsdl = "http://192.168.40.205:80/SrvScnGenerarDocumentoDesembolso-war/v1?wsdl";
			String wsdl = datosServicio.get("ws.endpoint").toString();
			com.davivienda.srvscngenerardocumentodesembolso.v1.V1 clienteWs = new com.davivienda.srvscngenerardocumentodesembolso.v1.V1(new URL(wsdl));
			PortSrvScnGenerarDocumentoDesembolsoSOAP port = clienteWs.getPortSrvScnGenerarDocumentoDesembolsoSOAP();
            setTimeOut(port);
			MsjSolOpGenerarDocumentoDesembolso requestType = new MsjSolOpGenerarDocumentoDesembolso();
			com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo dataHeaderReqType = new com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo();
			com.davivienda.srvscngenerardocumentodesembolso.v1.DatosSolicitud dataReqType = new com.davivienda.srvscngenerardocumentodesembolso.v1.DatosSolicitud();
			
			// Data header
			
			com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.serviciotipo.v1.ServicioTipo servicio = new com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.serviciotipo.v1.ServicioTipo();
			
			servicio.setIdServicio((String)datosServicio.get("idServicio"));
			
			dataHeaderReqType.setServicio(servicio);
			
			com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.operacioncanaltipo.v1.OperacionCanalTipo operacion = new com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.operacioncanaltipo.v1.OperacionCanalTipo();
			
			operacion.setIdSesion((String)datosServicio.get("idSesion"));
			operacion.setIdTransaccion(FormatDateSlashed.fechaHoyformatYMDHMS());
			operacion.setFecOperacion(FormatDateSlashed.getXMLGregorianCalendarActual());
			operacion.setValJornada((String)datosServicio.get("valJornada"));
			operacion.setCodMoneda((String)datosServicio.get("codMoneda"));
			operacion.setCodPais((String)datosServicio.get("codPais"));
			operacion.setCodIdioma((String)datosServicio.get("codIdioma"));
			
			dataHeaderReqType.setOperacionCanal(operacion);
			
			com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.consumidortipo.v1.ConsumidorTipo consumidor = new com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.consumidortipo.v1.ConsumidorTipo();
			consumidor.setIdConsumidor((String)datosServicio.get("idConsumidor"));
			com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.aplicaciontipo.v1.AplicacionTipo aplicacion = new com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.aplicaciontipo.v1.AplicacionTipo();
			aplicacion.setIdAplicacion((String)datosServicio.get("idAplicacion"));
			consumidor.setAplicacion(aplicacion);
			com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.canaltipo.v1.CanalTipo canal = new com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.canaltipo.v1.CanalTipo();
			canal.setIdCanal(Short.parseShort((String)datosServicio.get("idCanal")));
			canal.setIdHost((String)datosServicio.get("idHost"));
			consumidor.setCanal(canal);
			com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.terminaltipo.v1.TerminalTipo terminal = new com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.terminaltipo.v1.TerminalTipo();
			terminal.setIdTerminal(Integer.parseInt((String)datosServicio.get("idTerminal")));
			terminal.setValOrigenPeticion(StringFormat.trim(InetAddress.getLocalHost().getHostAddress()));
			terminal.setCodUsuario((String)datosServicio.get("codUsuario"));
			terminal.setValPerfil((String)datosServicio.get("valPerfil"));
			consumidor.setTerminal(terminal);
			
			dataHeaderReqType.setCriteriosOrdenamiento(new com.davivienda.srvscngenerardocumentodesembolso.v1.esquemas.framework.contextosolicitudtipo.v1.ContextoSolicitudTipo.CriteriosOrdenamiento());
			dataHeaderReqType.setConsumidor(consumidor);
			
			SolOpConsultarPagare solOpConsultar = new SolOpConsultarPagare();
			solOpConsultar.setProducto(new ProductoTipo());
			
			com.davivienda.srvscngenerardocumentodesembolso.v1.CodigoDepositanteTipo codigo = new com.davivienda.srvscngenerardocumentodesembolso.v1.CodigoDepositanteTipo();
			codigo.setCodigoDepositante(51);
			solOpConsultar.setCodigoDepositante(codigo);
			
			ConsultaPagareServiceTipo consultaPagareS = new ConsultaPagareServiceTipo();
			
			consultaPagareS.setCodigoDeceval(NumericFormat.parseInteger(data.getConsultaPagareService().getCodigoDeceval()));
			consultaPagareS.setNumPagareEntidad("");
			consultaPagareS.setIdTipoIdentificacionFirmante(NumericFormat.parseInteger(data.getConsultaPagareService().getIdTipoIdentificacionFirmante()));
			consultaPagareS.setNumIdentificacionFirmante((String)data.getConsultaPagareService().getNumIdentificacionFirmante());
			
			solOpConsultar.setConsultaPagareService(consultaPagareS);
			
			dataReqType.setConsultarPagare(solOpConsultar);
			
			
			SolOpGenerarPaquete generarPaquete = new SolOpGenerarPaquete();
			
			generarPaquete.setPaqueteDocId(data.getPaqueteDocId());
			
			
			com.davivienda.srvscngenerardocumentodesembolso.v1.Cliente clienteDocs = new com.davivienda.srvscngenerardocumentodesembolso.v1.Cliente();
			
			clienteDocs.setValMail(data.getCliente().getValMail());
			clienteDocs.setValNumeroIdentificacion(data.getCliente().getValNumeroIdentificacion());
			clienteDocs.setValTipoIdentificacion(data.getCliente().getValTipoIdentificacion());
			
			generarPaquete.setCliente(clienteDocs);
			
			com.davivienda.srvscngenerardocumentodesembolso.v1.Parametros parametros = new com.davivienda.srvscngenerardocumentodesembolso.v1.Parametros();
			for( ParametroVo p : data.getParametros().getParametro()){
				
				com.davivienda.srvscngenerardocumentodesembolso.v1.Valor v = new com.davivienda.srvscngenerardocumentodesembolso.v1.Valor();
				
				v.setId(p.getId());
				v.setValor(p.getValor());
				parametros.getValParametros().add(v);
				
			
			}
			
			
			ParametroTabla parametrosTabla = new ParametroTabla();
			parametrosTabla.setValIdTabla("DEBITO AUTOMATICO");
						
			Columna col = new Columna();
			col.getValNombreColumnas().add("Producto");
			col.getValNombreColumnas().add("Débito Automático");
			col.getValNombreColumnas().add("Cuenta Débito Automático");
			
			parametrosTabla.setColumnas(col);
			Registros registros = new Registros();			
			Registro registro = new Registro();
			com.davivienda.srvscngenerardocumentodesembolso.v1.Valor valorParam = new com.davivienda.srvscngenerardocumentodesembolso.v1.Valor();
			valorParam.setId("Producto");
			valorParam.setValor("TDC GENERICA VISA");
			registro.getValParametros().add(valorParam);
			valorParam = new com.davivienda.srvscngenerardocumentodesembolso.v1.Valor();
			valorParam.setId("Medio Entrega");
			valorParam.setValor("NO");
			registro.getValParametros().add(valorParam);
			valorParam = new com.davivienda.srvscngenerardocumentodesembolso.v1.Valor();
			valorParam.setId("Cuenta Débito Automático");
			valorParam.setValor(" ");
			registro.getValParametros().add(valorParam);
			registros.getRegistros().add(registro);
			parametrosTabla.setRegistros(registros);
			
			parametros.getParametroTablas().add(parametrosTabla);
			
			parametrosTabla = new ParametroTabla();
			parametrosTabla.setValIdTabla("ENTREGA EXTRACTOS");
						
			col = new Columna();
			col.getValNombreColumnas().add("Producto");
			col.getValNombreColumnas().add("Medio Entrega");
			col.getValNombreColumnas().add("Direccion/Mail");
			
			parametrosTabla.setColumnas(col);
			registros = new Registros();			
			registro = new Registro();
			valorParam = new com.davivienda.srvscngenerardocumentodesembolso.v1.Valor();
			valorParam.setId("Producto");
			valorParam.setValor("TDC GENERICA VISA");
			registro.getValParametros().add(valorParam);
			valorParam = new com.davivienda.srvscngenerardocumentodesembolso.v1.Valor();
			valorParam.setId("Medio Entrega");
			valorParam.setValor("PUBLICADO");
			registro.getValParametros().add(valorParam);
			valorParam = new com.davivienda.srvscngenerardocumentodesembolso.v1.Valor();
			valorParam.setId("Direccion/Mail");
			valorParam.setValor(" ");
			registro.getValParametros().add(valorParam);
			registros.getRegistros().add(registro);
			parametrosTabla.setRegistros(registros);
			
			parametros.getParametroTablas().add(parametrosTabla);
			
			com.davivienda.srvscngenerardocumentodesembolso.v1.AdjuntoTipo adjunto = new com.davivienda.srvscngenerardocumentodesembolso.v1.AdjuntoTipo();
			
			adjunto.setValNombre("huella_registrada");
			adjunto.setValContenido(((String)data.getParametros().getAdjunto().get(0).get("valContenido")));
			adjunto.setValTipo("PNG");
			parametros.getAdjuntos().add(adjunto);
			
			generarPaquete.setListaParametros(parametros);
			
			generarPaquete.setEnviarCopiaCorreo(true);
			generarPaquete.setRequiereClave(true);
			generarPaquete.setValClaveDocumento(data.getValClaveDocumento());
			
			dataReqType.setGenerarPaquete(generarPaquete);

			requestType.setContextoSolicitud(dataHeaderReqType);
			requestType.setData(dataReqType);

			// Grabar log transaccional request
						UtilityFunctions.grabarLogTransaccionalRequest(rowId, 0, (short) 0,
								canal.getIdCanal(), (short) 0, "",
								StringFormat.trim(datosServicio.get("Usuario")), "validacionesPrevias");

			requestType.setData(dataReqType);
			requestType.setContextoSolicitud(dataHeaderReqType);
						
			input = XmlUtil.convertObjectToXmlWithoutRootElement(requestType, true);
			
			// Ejecutar servicio
			MsjRespOpGenerarDocumentoDesembolso respuestaWs = port.opGenerarDocumentoDesembolso(requestType);

			output = XmlUtil.convertObjectToXmlWithoutRootElement(respuestaWs, false);
			
			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			
			if ("M".equals(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValCaracterAceptacion()) && !("0").equals(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValNumeroAprobacion())) {
	
				String msgRespuesta = "Error en el servicio";
	
				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(msgRespuesta);
				UtilityFunctions.writeError(datosServicio, rowId, msgRespuesta, logger);
	
			} else  {
	
				mapaRetorno.put("caracterAceptacion", StringFormat.trim(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValNumeroAprobacion()));
				mapaRetorno.put("estado", respuestaWs.getEstado());

				// Grabar log transaccional request
				UtilityFunctions.grabarLogTransaccionalRequest(rowId, 0, (short) 0,	canal.getIdCanal(), (short) 0, "", StringFormat.trim(datosServicio.get("Usuario")), "validacionesPrevias");
	
			} 

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
			writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		} finally {
			
			try {
				MainDataBase.getInstance().guardarTrazaVentaLinea(rowId, StringFormat.trim(datosServicio.get("Usuario")), "generarDocsDesembolso", input, output);
			} catch (Exception e) {
				UtilityFunctions.writeError("No pudo guardar en BD la traza venta linea", e, new HashMap<String, Object>(), logger);
			}
			
		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;
	}
	
	public Map<String, Object> generarReporte(Map<String, Object> datosServicio, GenerarReporteVo data, StringBuilder logEntry) {

		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		String input = null;
		String output = null;

		
		Map<String, Object> mapaRetorno = new HashMap<String, Object>();

		try {
			
			// Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");			
//			String wsdl = "http://192.168.40.205/GenerarReporte/SrvScnGenercionReporte/v1?wsdl";
			String wsdl = datosServicio.get("ws.endpoint").toString();
			com.davivienda.generarreporte.srvscngeneracionreporte.v1.V1 clienteWs = new com.davivienda.generarreporte.srvscngeneracionreporte.v1.V1(new URL(wsdl));
			PortSrvScnGeneracionReporteSOAP port = clienteWs.getPortSrvScnGeneracionReporteSOAP();
            setTimeOut(port);
			MsjSolOpGeneracionReporte requestType = new MsjSolOpGeneracionReporte();
			// Data header
					
			ClienteType cliente = new ClienteType();
			cliente.setNumeroIdentificacion((String)datosServicio.get("cliente-valNumeroIdentificacion"));
			cliente.setTipoIdentificacion((String)datosServicio.get("cliente-valTipoIdentificacion"));
			cliente.setNombres((String)datosServicio.get("cliente-nombres"));
			cliente.setPrimerApellido((String)datosServicio.get("cliente-primerApellido"));
			cliente.setSegundoApellido((String)datosServicio.get("cliente-segundoApellido"));
			cliente.setValMail((String)datosServicio.get("cliente-valMail"));
			
			requestType.setCliente(cliente);
			
			ContextoSolicitudTipo contexto = new ContextoSolicitudTipo();
			
			ServicioTipo servicio = new ServicioTipo();
			
			servicio.setIdServicio((String)datosServicio.get("idServicio"));
			
			contexto.setServicio(servicio);
			
			OperacionCanalTipo operacion = new OperacionCanalTipo();
			
			operacion.setIdSesion(data.getRowId());
			operacion.setCodMoneda((String)datosServicio.get("CodMoneda"));
			operacion.setCodIdioma((String)datosServicio.get("CodIdioma"));
			operacion.setIdTransaccion(FormatDateSlashed.fechaHoyformatYMDHMS());
			operacion.setValJornada((String)datosServicio.get("Jornada"));
			operacion.setCodPais((String)datosServicio.get("CodPais"));
			operacion.setFecOperacion(FormatDateSlashed.getXMLGregorianCalendarActual());
			
			contexto.setOperacionCanal(operacion);
			
			ConsumidorTipo consumidorTipo = new ConsumidorTipo();
			AplicacionTipo aplicacion = new AplicacionTipo();
			aplicacion.setIdAplicacion((String)datosServicio.get("IdAplicacion"));
			consumidorTipo.setAplicacion(aplicacion);
			
			CanalTipo canal = new CanalTipo();
			canal.setIdCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			canal.setIdHost((String)(datosServicio.get("IdHost")));
			consumidorTipo.setCanal(canal);
			
			consumidorTipo.setIdConsumidor((String)(datosServicio.get("IdCosumidor")));
			
			TerminalTipo terminal = new TerminalTipo();
			terminal.setIdTerminal(NumericFormat.parseInteger(datosServicio.get("IdTerminal")));
			terminal.setCodUsuario((String)(datosServicio.get("Usuario")));
			terminal.setValPerfil((String)(datosServicio.get("Perfil")));
			terminal.setValOrigenPeticion(StringFormat.trim(InetAddress.getLocalHost().getHostAddress()));
			consumidorTipo.setTerminal(terminal);
			
			contexto.setConsumidor(consumidorTipo);
			
			requestType.setContextoSolicitud(contexto);
			
			ReporteType reporte = new ReporteType();
			
			reporte.setTipoCertificacion((String)(datosServicio.get("tipoCertificacion")));
			reporte.setCiudadEmision((String)(datosServicio.get("ciudadEmision")));
			reporte.setTituloPersonal((String)(datosServicio.get("tituloPersonal")));
			reporte.setDirigidoA((String)(datosServicio.get("dirigidoA")));
			reporte.setFormato((String)(datosServicio.get("formato")));
			
			requestType.setReporte(reporte);
			
			ProductoType producto = new ProductoType();
			
			producto.setCodigoSubProducto((String)(datosServicio.get("producto-codigoSubProducto")));
			producto.setCodigoTipoProducto((String)(datosServicio.get("producto-codigoTipoProducto")));
			producto.setNumeroProducto((String)(datosServicio.get("producto-numeroProducto")));
			
			requestType.setProducto(producto);
			
			requestType.setEnviarCopiaCorreo(((String)datosServicio.get("enviarCopiaCorreo")).equals("true"));
			requestType.setRequiereClave(((String)datosServicio.get("requiereClave")).equals("true"));
			requestType.setRetornaDocumento(((String)datosServicio.get("retornaDocumento")).equals("true"));
			requestType.setEnviarFileNet(((String)datosServicio.get("enviarFileNet")).equals("true"));
			requestType.setRequiereClaveFileNet(((String)datosServicio.get("requiereClaveFileNet")).equals("true"));
			requestType.setValClaveDocumento((String)datosServicio.get("valClaveDocumento"));
			
			Notificacion notificacion = new Notificacion();
			notificacion.setTipoNotificacion((String)datosServicio.get("tipoNotificacion"));
			
			
			MensajeTipo mensaje = new MensajeTipo();
			
			mensaje.setValAsunto((String)datosServicio.get("valAsunto"));
			mensaje.setFormato((String)datosServicio.get("formatoPlantilla"));
			
			PlantillaTipo plantilla = new PlantillaTipo();
			plantilla.setIdPlantilla((String)datosServicio.get("idPlantilla"));
			
			mensaje.setPlantilla(plantilla);
			notificacion.setMensaje(mensaje);
			
			requestType.setNotificacion(notificacion);
			
			com.davivienda.generarreporte.srvscngeneracionreporte.v1.Parametros params = new com.davivienda.generarreporte.srvscngeneracionreporte.v1.Parametros();
						
			for (ParametroVo parameto: data.getParametro()) {
				com.davivienda.generarreporte.srvscngeneracionreporte.v1.Valor valor = new com.davivienda.generarreporte.srvscngeneracionreporte.v1.Valor();
				valor.setId(parameto.getId());
				valor.getValor().add(parameto.getValor());
				
				params.getValParametro().add(valor);
			}
			
			requestType.setListaParametros(params);
			
			input = XmlUtil.convertObjectToXmlWithoutRootElement(requestType, false);
			
			// Ejecutar servicio
			MsjRespOpGeneracionReporte respuestaWs = port.opGeneracionReporte(requestType);

			output = XmlUtil.convertObjectToXmlWithoutRootElement(respuestaWs, false);
			
			if (respuestaWs == null) {

				throw new Exception("respuestaWs es nulo");

			}

			
			if ("M".equals(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValCaracterAceptacion())) {
	
				String msgRespuesta = "Error en el servicio";
	
				mapaRetorno.put("caracterAceptacion", "M");
				mapaRetorno.put("codMsgRespuesta", "5");
				mapaRetorno.put("msgRespuesta", respuestaWs.getContextoRespuesta().getError() != null ? respuestaWs.getContextoRespuesta().getError().getValMsjRespuesta() : msgRespuesta);
//				mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(respuestaWs.getContextoRespuesta().getError().getValMensajeRespuesta());
				UtilityFunctions.writeError(datosServicio, data.getRowId(), msgRespuesta, logger);
	
			} else  {
	
				mapaRetorno.put("caracterAceptacion", StringFormat.trim(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValCaracterAceptacion()));
				mapaRetorno.put("codMsgRespuesta", StringFormat.trim(respuestaWs.getContextoRespuesta().getResultadoTransaccion().getValNumeroAprobacion()));
				mapaRetorno.put("contextoRepuesta", respuestaWs.getContextoRespuesta());
				ByteArrayOutputStream out = new ByteArrayOutputStream();
//				respuestaWs.getRespuestaCertificado().getContenido().
				respuestaWs.getRespuestaCertificado().getContenido().writeTo(out);
				Base64 codec = new Base64();
				mapaRetorno.put("contenido", new String(codec.encode(out.toByteArray())));
				mapaRetorno.put("mimeType", respuestaWs.getRespuestaCertificado().getMimeType());
				
				// Grabar log transaccional request
				UtilityFunctions.grabarLogTransaccionalRequest(data.getRowId(), 0, (short) 0,	canal.getIdCanal(), (short) 0, "", StringFormat.trim(datosServicio.get("Usuario")), "validacionesPrevias");
	
			} 

		} catch (Exception e) {

			mapaRetorno = UtilityFunctions.obtenerMapaRespuestaPorMal(e.getMessage());
			writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);

		} finally {
			
			try {
				MainDataBase.getInstance().guardarTrazaVentaLinea((String) datosServicio.get("rowId"), StringFormat.trim(datosServicio.get("Usuario")), "generarReporte", input, output);
			} catch (Exception e) {
				UtilityFunctions.writeError("No pudo guardar en BD la traza venta linea", e, new HashMap<String, Object>(), logger);
			}
			
		}

		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());

		return mapaRetorno;
	}

	public Map<String,Object> aperturaCuentaAhorro(Map<String,Object> datosServicio, StringBuilder logEntry) {  
		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		if(logger.isDebugEnabled()){
			writeDebug(logEntry, StringFormat.trim(datosServicio.get("rowId")), "[RowId: " + datosServicio.get("rowId") + "] Parametros:"
					+" tipoIdentificacion: "+datosServicio.get("tipoIdentificacion")
					+" numeroIdentificacion: "+datosServicio.get("numeroIdentificacion"));
		}
		
		String input = null;
		String output = null;
		
		Map<String,Object> mapaRetorno = new HashMap<String,Object>();
		
		
		try {
			//Configuracion propia del webservice
			//String wsdl = datosServicio.get("ws.endpoint").toString().concat("?wsdl");
			String wsdl = datosServicio.get("ws.endpoint").toString();
			AperturaCuentaAhorrosHTTPService clienteWS = new AperturaCuentaAhorrosHTTPService(new URL(StringFormat.trim(wsdl)));
			AperturaCuentaAhorrosPortType port = clienteWS.getAperturaCuentaAhorrosSOAPHTTPPort();
            setTimeOut(port);
			RequestaperturaCuentaAhorrosType requestType = new RequestaperturaCuentaAhorrosType();
			
			com.davivienda.xml.aperturacuentaahorros.DataHeaderReqType dataHeaderReqType = new com.davivienda.xml.aperturacuentaahorros.DataHeaderReqType();
			dataHeaderReqType.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeaderReqType.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeaderReqType.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeaderReqType.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeaderReqType.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeaderReqType.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeaderReqType.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeaderReqType.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			
			requestType.setDataHeader(dataHeaderReqType);
			
			com.davivienda.xml.aperturacuentaahorros.DataReqType dataReqType = new com.davivienda.xml.aperturacuentaahorros.DataReqType();
			
			BeanWrapper dataReq = new BeanWrapperImpl(new com.davivienda.xml.aperturacuentaahorros.DataReqType());
			for( Entry<String, Object> dataProperty : datosServicio.entrySet()){
				if(dataReq.getPropertyType(dataProperty.getKey()) != null){
					dataReq.setPropertyValue(dataProperty.getKey(), dataProperty.getValue());
				}
			}
			dataReqType = (com.davivienda.xml.aperturacuentaahorros.DataReqType) dataReq.getWrappedInstance();
			
			requestType.setData(dataReqType);
		
		
			String cuerpo =   TOTAL + StringFormat.trim(datosServicio.get("Total"))
							+ JORNADA + StringFormat.trim(datosServicio.get("Jornada"))
							+ CANAL + StringFormat.trim(datosServicio.get("Canal"))
							+ PERFIL + StringFormat.trim(datosServicio.get("Perfil"))
							+ VERSION + StringFormat.trim(datosServicio.get("VersionServicio"));
		
		
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(datosServicio.get("rowId")), StringFormat.trim(datosServicio.get("Usuario")), "", "", StringFormat.trim(datosServicio.get("NombreOperacion")) + QUERY_REQUEST , cuerpo);
		
			input = XmlUtil.convertObjectToXmlWithoutRootElement(requestType, false);
			
			ResponseaperturaCuentaAhorrosType respuesta = port.aperturaCuentaAhorros(requestType);
			
			output = XmlUtil.convertObjectToXmlWithoutRootElement(respuesta, false);
			
			if(respuesta != null){
				if(respuesta.getData() != null)
					mapaRetorno = MapeadorDatosWs.retornaValoresWS(respuesta.getData());
				if(respuesta.getDataHeader() != null)
					mapaRetorno.putAll(MapeadorDatosWs.retornaValoresWS(respuesta.getDataHeader()));
			}
		
			cuerpo =  TOTAL + StringFormat.trim(mapaRetorno.get("total")) 
					+ CACEPTACION + StringFormat.trim(mapaRetorno.get("caracterAceptacion"))
					+ ULTMSG + StringFormat.trim(mapaRetorno.get("ultimoMensaje"))
					+ CODRESPUESTA + StringFormat.trim(mapaRetorno.get("codMsgRespuesta"));
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(mapaRetorno.get("rowId")), "", "", "", StringFormat.trim(mapaRetorno.get("nombreOperacion")) + QUERY_RESPONSE , cuerpo);
		} catch (Exception e) {
			mapaRetorno.put("codMsgRespuesta", "5");
			mapaRetorno.put("msgRespuesta", "Ha ocurrido un error inesperado.");
			writeError(logEntry, StringFormat.trim(datosServicio.get("rowId")), e, datosServicio);
		} finally {
			
			try {
				MainDataBase.getInstance().guardarTrazaVentaLinea((String) datosServicio.get("rowId"), StringFormat.trim(datosServicio.get("Usuario")), "aperturaCuentaAhorro", input, output);
			} catch (Exception e) {
				UtilityFunctions.writeError("No pudo guardar en BD la traza venta linea", e, new HashMap<String, Object>(), logger);
			}
			
		}
		writeFinInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		return mapaRetorno;
			
    }
	
	 /**
     * Obtener lista de productos homologados para el servicio de consultaSaldosPromedios
     * @param registros de la respuesta del servicio para que sean homologados
     * @return lista con los productos homologados
     */
    private ConsultaSalProRespHomologo getRegistrosHomologadosConSaldosPromed(DataResp respuesta) {
    	
    	if (respuesta == null) {
    		return null;
		}
    	
    	ConsultaSalProRespHomologo productoHomologado = new ConsultaSalProRespHomologo();

		try {

			BeanUtils.copyProperties(productoHomologado, respuesta);
			
		} catch (Exception e) {
			logger.error(e.getMessage());
			
		}
    	
    	return productoHomologado;
    	
    }
    
    /**
     * Obtener lista de productos homologados para el servicio de consultaSaldosCorte
     * @param registros de la respuesta del servicio para que sean homologados
     * @return lista con los productos homologados
     */
    private ConsultaSalCorteHomologo getRegistrosHomologadosConSaldosCorte(DataRespType dataRespType) {
    	
    	if (dataRespType == null) {
    		return null;
		}
    	
    	ConsultaSalCorteHomologo productoHomologado = new ConsultaSalCorteHomologo();

		try {

			BeanUtils.copyProperties(productoHomologado, dataRespType);
			
		} catch (Exception e) {
			logger.error(e.getMessage());
			
		}
    	
    	return productoHomologado;
    	
    }
    	
    private void writeError(StringBuilder logEntry, String msg, Exception rex, Map<String, Object> datos) {
		if (Validadores.isValidLogInput(msg)) {
			logEntry.append("\n             - " + "[RowId: " + msg + "] [ERROR] Error en la conexión con el bus: " + rex.getMessage());
		}
		StringBuilder str = new StringBuilder(3072);
		for (Map.Entry<String, Object> entry : datos.entrySet()) {
			str.append(entry.getKey());
			str.append("=");
			str.append(entry.getValue());
			str.append(";");
		}
		if (Validadores.isValidLogInput(str.toString()))
			logEntry.append("\n             - " + "[RowId: " + msg + "] [ERROR] Datos de entrada:\r\n" + str.toString());
	}
	
	private void writeErrorEntry(StringBuilder logEntry, String rowId, String msg) {
		if (Validadores.isValidLogInput(rowId)) {
			logEntry.append("\n             - " + "[RowId: " + rowId + "] [ERROR] " + msg);
		}
	}
	
	private void writeDebug(StringBuilder logEntry, String rowId, String msg) {
		if (logger.isDebugEnabled() && Validadores.isValidLogInput(rowId)) {
			logEntry.append("\n             - " + "[RowId: " + rowId + "] [DEBUG] " + msg);
		}
	}

	private void writeInitInfo(StringBuilder logEntry, String rowId, String msg) {
		if (logger.isInfoEnabled() && Validadores.isValidLogInput(rowId)) {
			logEntry.append("\n             - " + "[RowId: " + rowId + "] Inicio " + msg);
		}
	}

	private void writeFinInfo(StringBuilder logEntry, String rowId, String msg) {
		if (logger.isInfoEnabled() && Validadores.isValidLogInput(rowId)) {
			logEntry.append("\n             - " + "[RowId: " + rowId + "] Fin " + msg);
		}
	}
	
	public String obtenerValorHomologado(String valor, int idConcepto){   
		try {
	       HomologacionDto homoloagacion = MainDataBase.getInstance().obtenerHomologacionesPorValorYIdConcepto(valor, idConcepto);
	       if(homoloagacion != null && homoloagacion.getDescripcion() != null)
	           return homoloagacion.getDescripcion();
	       else return null;
	   } catch (Exception e) {
	       return null;
	   }
	}
	
	private void setTimeOut (Object port) { 
		timeout = obtenerValorHomologado("Compartidos-api", 353);
		if (timeout == null) {
			timeout = timeoutDef;
		}
		Map<String, Object> requestContext = ((WSBindingProvider)port).getRequestContext();
		requestContext.put(BindingProviderProperties.REQUEST_TIMEOUT, Integer.parseInt(timeout)); // Timeout in millis
		requestContext.put(BindingProviderProperties.CONNECT_TIMEOUT, Integer.parseInt(timeout)); // Timeout in millis
	}
					
}
