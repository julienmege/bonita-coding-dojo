import groovy.json.JsonBuilder
import groovy.sql.Sql
import org.bonitasoft.console.common.server.page.*

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import java.util.logging.Logger

import static java.sql.DriverManager.registerDriver

class Index implements RestApiController {

    RestApiResponse doHandle(HttpServletRequest request, PageResourceProvider pageResourceProvider, PageContext pageContext, RestApiResponseBuilder apiResponseBuilder, RestApiUtil restApiUtil) {
        String queryId = request.getParameter "queryId"
        if (queryId == null) {
            return buildErrorResponse(apiResponseBuilder, "the parameter queryId is missing",restApiUtil.logger)
        }
        String query = getQuery queryId, pageResourceProvider
        if (query == null) {
            return buildErrorResponse(apiResponseBuilder, "the queryId does not refer to an existing query", restApiUtil.logger)
        }
        Map<String, String> params = getSqlParameters request
        Sql sql = buildSql pageResourceProvider
        try {
            def rows = params.isEmpty() ? sql.rows(query) : sql.rows(query, params)
            JsonBuilder builder = new JsonBuilder(rows)
            String table = builder.toPrettyString()
            return buildResponse(apiResponseBuilder, table)
        } finally {
            sql.close()
        }
    }

    protected RestApiResponse buildErrorResponse(RestApiResponseBuilder apiResponseBuilder, String message, Logger logger ) {
        logger.severe message

        Map<String, String> result = [:]
        result.put "error", message
        apiResponseBuilder.withResponseStatus(HttpServletResponse.SC_BAD_REQUEST)
        buildResponse apiResponseBuilder, result
    }

    protected RestApiResponse buildResponse(RestApiResponseBuilder apiResponseBuilder, Serializable result) {
        apiResponseBuilder.with {
            withResponse(result)
            build()
        }
    }

    protected Map<String, String> getSqlParameters(HttpServletRequest request) {
        Map<String, String> params = [:]
        for (String parameterName : request.getParameterNames()) {
            params.put(parameterName, request.getParameter(parameterName))
        }
        params.remove("queryId")
        params
    }

    protected Sql buildSql(PageResourceProvider pageResourceProvider) {
        Properties properties = loadProperties "datasource.properties", pageResourceProvider

        org.postgresql.Driver driver = new org.postgresql.Driver()
        registerDriver(driver)

        def url = properties["db.Url"]
        def user = properties["db.user"]
        def password = properties["db.password"]

        def conn = driver.connect(url, [user: user, password:password] as Properties)
        new Sql(conn)
//        Sql.newInstance(properties["db.Url"], properties["db.user"], properties["db.password"],properties["db.driverClass"]);
    }

    protected String getQuery(String queryId, PageResourceProvider pageResourceProvider) {
        Properties props = loadProperties "queries.properties", pageResourceProvider
        props[queryId]
    }

    protected Properties loadProperties(String fileName, PageResourceProvider pageResourceProvider) {
        Properties properties = new Properties()
        pageResourceProvider.getResourceAsStream(fileName).withStream {
            InputStream s -> properties.load s
        }
        properties
    }

}

