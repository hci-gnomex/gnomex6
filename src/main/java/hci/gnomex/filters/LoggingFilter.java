package hci.gnomex.filters;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

/**
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and
 * Proprietary
 *
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
