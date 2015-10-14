import com.bonitasoft.engine.api.TenantAPIAccessor
import org.bonitasoft.engine.session.APISession
import spock.lang.Specification

/**
 * @author Laurent Leseigneur
 */
class EngineIntegrationTest extends Specification {


    def server

    def setup() {
        def bonitaHomeFolder = Index.getResource("bonita-home").file //+ "/bonita-home"
        println "using bonita home: ${bonitaHomeFolder}"
        System.setProperty("bonita.home", bonitaHomeFolder)
    }


    def "call queries"() {

        when:
        APISession apiSession = TenantAPIAccessor.getLoginAPI().login(1L, "walter.bates", "bpm")

        then:
        apiSession != null

    }

}
