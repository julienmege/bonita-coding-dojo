

import org.bonitasoft.console.common.server.page.PageResourceProvider
import org.bonitasoft.engine.api.PageAPI
import org.bonitasoft.engine.page.Page
import org.bonitasoft.engine.page.PageNotFoundException

/**
 * @author Laurent Leseigneur
 */
class PageResourceProviderCustom extends PageResourceProvider {

    protected PageResourceProviderCustom(String pageName, long tenantId) {
        super(pageName, tenantId)
    }

    @Override
    Page getPage(PageAPI pageAPI) throws PageNotFoundException {
    }

    @Override
    public InputStream getResourceAsStream(final String resourceName) throws FileNotFoundException {
        return new FileInputStream(getResourceAsFile(resourceName));
    }

    @Override
    public File getResourceAsFile(final String resourceName) {
        new File(Index.getResource(resourceName).file)
    }

}
