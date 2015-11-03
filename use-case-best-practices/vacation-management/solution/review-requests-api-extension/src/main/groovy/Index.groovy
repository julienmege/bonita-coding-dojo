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

        def session = pageContext.getApiSession();
        def processAPI = TenantAPIAccessor.getProcessAPI(session);
        def tasks = processAPI.searchMyAvailableHumanTasks(session.getUserId(), new SearchOptionsBuilder(0, 100)
                .sort(PRIORITY, Order.DESC)
                .filter(STATE_NAME, READY_STATE)
                .filter(NAME, "Review request")
                .done()).getResult();

        def BusinessObjectDAOFactory daoFactory = new BusinessObjectDAOFactory();
        def dao = daoFactory.createDAO(session, VacationRequestDAO.class);

        apiResponseBuilder.with {
            withResponse(new JsonBuilder(tasks.collect { task ->
                def context = processAPI.getUserTaskExecutionContext(task.getId());
                SimpleBusinessDataReference reference = context.get("vacationRequest_ref") as SimpleBusinessDataReference;
                return [
                        task           : task,
                        vacationRequest: dao.findByPersistenceId(reference.getStorageId())
                ]
            }).toPrettyString())
            build()
        }
    }
}
