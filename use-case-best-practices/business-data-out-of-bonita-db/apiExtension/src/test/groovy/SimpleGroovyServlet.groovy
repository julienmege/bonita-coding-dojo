import groovy.servlet.GroovyServlet
import org.bonitasoft.console.common.server.page.PageContext
import org.bonitasoft.console.common.server.page.RestApiResponseBuilder
import org.bonitasoft.console.common.server.page.RestApiUtilImpl
import org.bonitasoft.engine.session.impl.APISessionImpl

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class SimpleGroovyServlet extends GroovyServlet {


    public SimpleGroovyServlet() {


    }

    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
        System.setProperty("bonita.home", "target/bonita-home")

        def restApiUtil = new RestApiUtilImpl()
        def apiResponseBuilder = new RestApiResponseBuilder()
        def pageContext = new PageContext(new APISessionImpl(1L, new Date(), 2L, "walter.bates", 3L, "Tenant", 4L), Locale.FRENCH, "1")
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