
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.ServletContextHandler

def startJetty() {
    def server = new Server(8000)
    def context = new ServletContextHandler(server, "/API/extension/test", ServletContextHandler.SESSIONS);
    context.resourceBase = '.'
    context.addServlet(SimpleGroovyServlet, '/')
    context.setAttribute('version', '1.0')
    server.start()
}

startJetty()