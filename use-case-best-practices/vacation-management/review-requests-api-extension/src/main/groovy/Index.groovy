import bizdata.VacationRequestDAO
import groovy.json.JsonBuilder
import org.bonitasoft.console.common.server.page.*
import org.bonitasoft.engine.api.TenantAPIAccessor
import org.bonitasoft.engine.bdm.BusinessObjectDAOFactory
import org.bonitasoft.engine.business.data.SimpleBusinessDataReference
import org.bonitasoft.engine.search.Order
import org.bonitasoft.engine.search.SearchOptionsBuilder

import javax.servlet.http.HttpServletRequest

import static org.bonitasoft.engine.bpm.flownode.ActivityStates.READY_STATE
import static org.bonitasoft.engine.bpm.flownode.HumanTaskInstanceSearchDescriptor.*

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
}
