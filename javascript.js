package com.davivienda.piac.delegate.cautela;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.davivienda.piac.common.utils.FormatDateSlashed;
import com.davivienda.piac.common.utils.MapeadorDatosWs;
import com.davivienda.piac.common.utils.NumericFormat;
import com.davivienda.piac.common.utils.StringFormat;
import com.davivienda.piac.common.utils.Validadores;
import com.davivienda.www.xml.ListasRestrictivas.RegistroRespHomologadoType;
import com.davivienda.www.xml.ListasRestrictivas.RegistroRespType;


import com.davivienda.xml.consultacentralizadorlistasrestrictivas.ConsultaCentralizadorListasRestrictivasConsultaCentralizadorListasRestrictivasHTTPService;
import com.davivienda.xml.consultacentralizadorlistasrestrictivas.ConsultaCentralizadorListasRestrictivasPortType;
import com.davivienda.xml.consultacentralizadorlistasrestrictivas.DataHeaderReqType;
import com.davivienda.xml.consultacentralizadorlistasrestrictivas.DataReqType;
import com.davivienda.xml.consultacentralizadorlistasrestrictivas.RequestType;
import com.davivienda.xml.consultacentralizadorlistasrestrictivas.ResponseType;
import com.davivienda.piac.db.homologacion.main.MainDataBase;
import com.davivienda.piac.db.homologacion.model.HomologacionDto;
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
	private static final String CACEPTACION = ",cAceptacion:";
	private static final String ULTMSG= ",ultMsg:";
	private static final String CODRESPUESTA = ",codRespuesta:";
	
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
	
	/**
	 * Metodo que realiza el llamado al servicio listas restrictivas ws
	 * @param datosServicio
	 * @return
	 * @throws MalformedURLException 
	 */
	public Map<String,Object> listasRestrictivas(Map<String,Object> datosServicio, StringBuilder logEntry){
		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		if(logger.isDebugEnabled()){ 
			logger.debug("[RowId: " + datosServicio.get("rowId") + "] Parametros:"
				+" tipoIdentificacionTitular: "+datosServicio.get("tipoIdentificacionTitular")
				+" nroIdentificacionTitular: "+datosServicio.get("nroIdentificacionTitular"));
		}
		Map<String,Object> mapaRetorno = new HashMap<String,Object>();
		Node nodeAttribute = obtenerLocation(datosServicio);
		
		//Configuracion propia del webservice
		com.davivienda.www.xml.ListasRestrictivas.ListasRestrictivasPortTypeProxy clienteWs = new com.davivienda.www.xml.ListasRestrictivas.ListasRestrictivasPortTypeProxy();
		//clienteWs.setEndpoint(StringFormat.trim(datosServicio.get("ws.endpoint")));
		clienteWs.setEndpoint(nodeAttribute.getNodeValue());
		com.davivienda.www.xml.ListasRestrictivas.RequestType request = new com.davivienda.www.xml.ListasRestrictivas.RequestType();
		com.davivienda.www.xml.ListasRestrictivas.DataReqType data = new com.davivienda.www.xml.ListasRestrictivas.DataReqType();
		com.davivienda.www.xml.ListasRestrictivas.DataHeaderReqType dataHeader = new com.davivienda.www.xml.ListasRestrictivas.DataHeaderReqType();
		
		data.setTipoIdentificacionTitular(StringFormat.trim(datosServicio.get("tipoIdentificacionTitular")));
		data.setNroIdentificacionTitular(StringFormat.trim(datosServicio.get("nroIdentificacionTitular")));
		
		dataHeader.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
		dataHeader.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
		dataHeader.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
		dataHeader.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
		dataHeader.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
		dataHeader.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
		dataHeader.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
		dataHeader.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
		
		request.setData(data);
		request.setDataHeader(dataHeader);
		
		String cuerpo =   TOTAL + StringFormat.trim(datosServicio.get("Total"))
						+ JORNADA + StringFormat.trim(datosServicio.get("Jornada"))
						+ CANAL + StringFormat.trim(datosServicio.get("Canal"))
						+ PERFIL + StringFormat.trim(datosServicio.get("Perfil"))
						+ VERSION + StringFormat.trim(datosServicio.get("VersionServicio"));
		
		LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(datosServicio.get("rowId")), StringFormat.trim(datosServicio.get("Usuario")), "", "", StringFormat.trim(datosServicio.get("NombreOperacion")) + QUERY_REQUEST , cuerpo);
		
		try {			
			com.davivienda.www.xml.ListasRestrictivas.ResponseType respuesta = clienteWs.listasRestrictivas(request);			
			if(respuesta!=null && respuesta.getData()!= null){
				mapaRetorno = MapeadorDatosWs.retornaValoresWS(respuesta.getData());
				// se elimina solo la lista (sin homologacion)				
				mapaRetorno.remove("regtros");
				// se agrega lista homologada			
				mapaRetorno.put("registros", this.getListaHomologada(respuesta.getData().getRegistros()));
			}
			mapaRetorno.putAll(MapeadorDatosWs.retornaValoresWS(respuesta.getDataHeader()));
			
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
	
	
	public Map<String,Object> consultaListasRestrictivas(Map<String,Object> datosServicio, StringBuilder logEntry) {
		writeInitInfo(logEntry, StringFormat.trim(datosServicio.get("rowId")), datosServicio.get("ws.endpoint").toString());
		if(logger.isDebugEnabled()){ 
			logger.debug("[RowId: " + datosServicio.get("rowId") + "] Parametros:"
				+" tipoIdentificacionTitular: "+datosServicio.get("tipoIdentificacionTitular")
				+" nroIdentificacionTitular: "+datosServicio.get("nroIdentificacionTitular"));
		}
		Map<String,Object> mapaRetorno = new HashMap<String,Object>();

		try {
			
			//Configuracion propia del webservice
			ConsultaCentralizadorListasRestrictivasConsultaCentralizadorListasRestrictivasHTTPService clienteWs = new ConsultaCentralizadorListasRestrictivasConsultaCentralizadorListasRestrictivasHTTPService(new URL(datosServicio.get("ws.endpoint").toString()));
			ConsultaCentralizadorListasRestrictivasPortType port = clienteWs.getConsultaCentralizadorListasRestrictivasConsultaCentralizadorListasRestrictivasHTTPPort();
			
			RequestType request = new RequestType();
			DataReqType data = new DataReqType();
			DataHeaderReqType dataHeader = new DataHeaderReqType();
			
					
			data.setCodCodigoSolicitud(StringFormat.trim(datosServicio.get("codigoSolicitud")));
			data.setValVersionApp("1.0.0");
			data.setFecFechaNacimiento(datosServicio.get("fechaNacimiento")!= null ? FormatDateSlashed.convertirFechaStringToGregorianCalendar((datosServicio.get("fechaNacimiento")), "yyyy-MM-dd'T'HH:mm:ss") : null);
			data.setValGenero(datosServicio.get("genero") != null ? StringFormat.trim(datosServicio.get("genero")) : null);
			data.setValNombre(StringFormat.trim(datosServicio.get("nombre")));
			data.setValNumeroIdentificacion(StringFormat.trim(datosServicio.get("nroIdentificacionTitular")));
			data.setValPaisNacimiento(datosServicio.get("valPaisNacimiento") != null ? StringFormat.trim(datosServicio.get("valPaisNacimiento")) : null);
			data.setCodTipo(StringFormat.trim(datosServicio.get("codTipo")));
			data.setCodTipoIdentificacion(StringFormat.trim(datosServicio.get("tipoIdentificacionTitular")));
	
			
			dataHeader.setCanal(NumericFormat.parseShort(datosServicio.get("Canal")));
			dataHeader.setJornada(NumericFormat.parseShort(datosServicio.get("Jornada")));
			dataHeader.setModoDeOperacion(NumericFormat.parseShort(datosServicio.get("ModoDeOperacion")));
			dataHeader.setNombreOperacion(StringFormat.trim(datosServicio.get("NombreOperacion")));
			dataHeader.setPerfil(NumericFormat.parseShort(datosServicio.get("Perfil")));
			dataHeader.setTotal(NumericFormat.parseInteger(datosServicio.get("Total")));
			dataHeader.setUsuario(StringFormat.trim(datosServicio.get("Usuario")));
			dataHeader.setVersionServicio(StringFormat.trim(datosServicio.get("VersionServicio")));
			dataHeader.setIdTransaccion(FormatDateSlashed.fechaHoyformatYMDHMS());
			
			request.setData(data);
			request.setDataHeader(dataHeader);
			
			String cuerpo =   TOTAL + StringFormat.trim(datosServicio.get("Total"))
							+ JORNADA + StringFormat.trim(datosServicio.get("Jornada"))
							+ CANAL + StringFormat.trim(datosServicio.get("Canal"))
							+ PERFIL + StringFormat.trim(datosServicio.get("Perfil"))
							+ VERSION + StringFormat.trim(datosServicio.get("VersionServicio"));
			
			LogTrxDelegate.getInstance().grabarLogTransaccional(StringFormat.trim(datosServicio.get("rowId")), StringFormat.trim(datosServicio.get("Usuario")), "", "", StringFormat.trim(datosServicio.get("NombreOperacion")) + QUERY_REQUEST , cuerpo);
		
					
			ResponseType respuesta = port.consultaCentralizadorListasRestrictivas(request);			
			if(respuesta!=null && respuesta.getData()!= null){
				mapaRetorno = MapeadorDatosWs.retornaValoresWS(respuesta.getData());
			}
			mapaRetorno.putAll(MapeadorDatosWs.retornaValoresWS(respuesta.getDataHeader()));
			
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
	
	/**
	 * Metodo que homologa el contenido del arreglo de salida del ws
	 * @param registros
	 * @return
	 */
	private RegistroRespHomologadoType[] getListaHomologada(RegistroRespType[] registros){
		if(registros == null || registros.length <= 0)
			return null;
		
		int i = 0;
		RegistroRespHomologadoType[] arrResp = new RegistroRespHomologadoType[registros.length];
		RegistroRespHomologadoType respuestaHomologada = null;
		for (RegistroRespType registro : registros) {
			respuestaHomologada = new RegistroRespHomologadoType();
			BeanUtils.copyProperties(registro, respuestaHomologada);
			arrResp[i] = respuestaHomologada;
			i++;
		}
		return arrResp;
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
	
	private Node obtenerLocation(Map<String,Object> datosServicio) {
		String filepath = StringFormat.trim(datosServicio.get("ws.endpoint"));
        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder;
        Document doc = null;
        Node address = null;
        NamedNodeMap attribute = null;
        Node nodeAttribute = null;
        
		try {
			docBuilder = docFactory.newDocumentBuilder();
			doc = docBuilder.parse(filepath);
			address= doc.getElementsByTagName("soap11:address").item(0);
			attribute = address.getAttributes();
			nodeAttribute = attribute.getNamedItem("location");
			nodeAttribute.getNodeValue();

		} catch (Exception e) {

			logger.error("Error creando el endpoint del servicio");			
							
		}
		return nodeAttribute;
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
		timeout = obtenerValorHomologado("Cautela-api", 353); 
		if (timeout == null) {
			timeout = timeoutDef;
		}
		Map<String, Object> requestContext = ((WSBindingProvider)port).getRequestContext();
		requestContext.put(BindingProviderProperties.REQUEST_TIMEOUT, Integer.parseInt(timeout)); // Timeout in millis
		requestContext.put(BindingProviderProperties.CONNECT_TIMEOUT, Integer.parseInt(timeout)); // Timeout in millis
	}
}
