package hci.gnomex.filters;

import javax.servlet.*;
import java.io.IOException;

/**
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and
 * Proprietary
 * Created by u0556399 on 4/2/2020.
 */
public final class LoggingFilter implements Filter {

	private FilterConfig filterConfiguration;

	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		request.setAttribute(filterConfiguration.getInitParameter("shouldSkipLog"), "true");
		chain.doFilter(request, response);
	}

	public void init(FilterConfig filterConfiguration) {
		this.filterConfiguration = filterConfiguration;
	}
	public void destroy() {
		this.filterConfiguration = null;
	}
}
