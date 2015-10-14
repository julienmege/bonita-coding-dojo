import com.bonitasoft.engine.api.TenantAPIAccessor
import groovy.servlet.GroovyServlet
import org.bonitasoft.console.common.server.page.PageContext
import org.bonitasoft.console.common.server.page.RestApiResponseBuilder
import org.bonitasoft.console.common.server.page.RestApiUtilImpl
import org.bonitasoft.engine.session.APISession

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class SimpleGroovyServlet extends GroovyServlet {


    public SimpleGroovyServlet() {


    }

    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {

        def bonitaHomeFolder = Index.getResource("bonita-home").file
//        println "using bonita home: ${bonitaHomeFolder}"
        System.setProperty("bonita.home", bonitaHomeFolder)

        APISession apiSession = TenantAPIAccessor.getLoginAPI().login(1L, "walter.bates", "bpm")

        def restApiUtil = new RestApiUtilImpl()
        def apiResponseBuilder = new RestApiResponseBuilder()

//        def sessionImpl = new APISessionImpl(1L, new Date(), 2L, "walter.bates", 3L, "Tenant", 4L)
        def pageContext = new PageContext(apiSession, Locale.FRENCH, "1")
        def pageResourceProvider = new PageResourceProviderCustom("pageName", 4L)
        def index = new Index()

        try {
            def restApiResponse = index.doHandle(request, pageResourceProvider, pageContext, apiResponseBuilder, restApiUtil)
            response.setStatus(restApiResponse.httpStatus)
            response.writer.print(restApiResponse.response)
        } catch (Exception e) {
            response.writer.print(e.getMessage())
            e.printStackTrace(response.writer)

        }

    }

}