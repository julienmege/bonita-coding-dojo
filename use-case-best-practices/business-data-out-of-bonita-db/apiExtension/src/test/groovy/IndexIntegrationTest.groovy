import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.ServletContextHandler
import spock.lang.Specification
import SimpleGroovyServlet

/**
 * @author Laurent Leseigneur
 */
class IndexIntegrationTest extends Specification {


    def server

    def setup() {
        server = new Server(8000)
        def context = new ServletContextHandler(server, "/API/extension/test", ServletContextHandler.SESSIONS);
        context.resourceBase = '.'
        context.addServlet(SimpleGroovyServlet, '/')
        context.setAttribute('version', '1.0')
        server.start()
    }

    def cleanup() {
        server.stop()
    }


    def "call queries"() {
        setup:
        def url = new URL("http://localhost:8000/API/extension/test/?queryId=getRequestKind")

        when:
        def data = url.getText()

        then:
        data == """[
    {
        "kind": "RTT"
    },
    {
        "kind": "Annual leave"
    }
]"""

    }

    def "call getMyLeaveRequest"() {
        setup:
        def url = new URL("http://localhost:8000/API/extension/test/?queryId=getMyLeaveRequest")

        when:
        def data = url.getText()

        then:
        data == """[
    {
        "user_id": "walter.bates",
        "start_date": "2015-09-29T22:00:00+0000",
        "end_date": "2015-09-29T22:00:00+0000",
        "kind": "RTT"
    },
    {
        "user_id": "walter.bates",
        "start_date": "2015-09-29T22:00:00+0000",
        "end_date": "2015-09-29T22:00:00+0000",
        "kind": "Annual leave"
    },
    {
        "user_id": "walter.bates",
        "start_date": "2015-10-06T22:00:00+0000",
        "end_date": "2015-10-06T22:00:00+0000",
        "kind": "RTT"
    },
    {
        "user_id": "walter.bates",
        "start_date": "2015-10-15T22:00:00+0000",
        "end_date": "2015-10-15T22:00:00+0000",
        "kind": "Annual leave"
    }
]"""

    }


}
