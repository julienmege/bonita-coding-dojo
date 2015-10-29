import groovy.json.JsonBuilder
import org.bonitasoft.console.common.server.page.*

import javax.servlet.http.HttpServletRequest

public class Index implements RestApiController {

    @Override
    RestApiResponse doHandle(HttpServletRequest request,
                             PageResourceProvider pageResourceProvider,
                             PageContext pageContext,
                             RestApiResponseBuilder apiResponseBuilder,
                             RestApiUtil restApiUtil) {

        apiResponseBuilder.withResponse(new JsonBuilder([]).toPrettyString());
        apiResponseBuilder.build();
    }

}
