const { Actor, log } = require('apify');

// got-scraping v3+ is ESM-only. Dynamically import it at runtime so this CommonJS project keeps working.
let _gotScrapingModule = null;
async function getGotScraping() {
    if (_gotScrapingModule) return _gotScrapingModule;
    _gotScrapingModule = await import('got-scraping');
    return _gotScrapingModule;
}

const { cleanProject, getSessionCookies, isProjectExcluded, notifyAboutMaxResults, stringifyDiscoverQuery } = require('./utils');
const { DISCOVER_JSON_URL, MAX_PAGES, PROJECTS_PER_PAGE } = require('./consts');

exports.handleStart = async ({ request, session }, query, requestQueue, proxyConfig, maxResults, excludeTerms) => {
    const cookies = await getSessionCookies(request.url, session, proxyConfig);
    const page = 1;
    const params = stringifyDiscoverQuery({ ...query, page });

    await requestQueue.addRequest({
        url: `${DISCOVER_JSON_URL}${params}`,
        userData: {
            cookies,
            page,
            label: 'PAGINATION-LIST',
            totalProjects: 0,
            savedProjects: 0,
            maximumResults: Math.min(maxResults, MAX_PAGES * PROJECTS_PER_PAGE),
            savedProjectIds: [],
            excludeTerms,
        },
    });
};

exports.handlePagination = async ({ request, session }, requestQueue, proxyConfiguration) => {
    const requestStartedAt = Date.now();
    let { page, totalProjects, savedProjects } = request.userData;
    const { cookies, excludeTerms, maximumResults, savedProjectIds, lastSuccessfulProxyUrl } = request.userData;
    const reusedProxy = request.retryCount === 0 && !!lastSuccessfulProxyUrl;

    log.info('Handling pagination page', { 
        page, 
        url: request.url,
        sessionId: session.id,
        savedProjects,
        totalProjects,
        retryCount: request.retryCount,
        reusedProxy,
    });

    // MAKING REQUEST => JSON OBJECT IN RESPONSE
    const proxyUrl = request.retryCount === 0 && lastSuccessfulProxyUrl
        ? lastSuccessfulProxyUrl
        : await proxyConfiguration.newUrl(session.id);
    const logKickstarterBlocked = () => {
        log.error('Received HTTP 403 from Kickstarter. Requests are likely being blocked. Switch to residential proxies.', {
            url: request.url,
            sessionId: session.id,
            proxyUrl,
            retryCount: request.retryCount,
        });
    };

    let response;
    try {
        const { gotScraping } = await getGotScraping();
        response = await gotScraping({
            url: request.url,
            proxyUrl,
            headers: {
                Accept: 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                Cookie: cookies,
            },
            responseType: 'json',
        });
    } catch (error) {
        if (error.response?.statusCode === 403) {
            logKickstarterBlocked();
            session.retire();
        }
        throw error;
    }

    const body = response.body;
    if (!Array.isArray(body.projects)) {
        const bodyType = Array.isArray(body) ? 'array' : typeof body;
        log.warning('Kickstarter returned an unexpected pagination response. Will retry with a new session/proxy.', {
            page,
            url: request.url,
            sessionId: session.id,
            statusCode: response.statusCode,
            bodyType,
            bodyKeys: body && typeof body === 'object' ? Object.keys(body).slice(0, 20) : undefined,
            bodyPreview: typeof body === 'string' ? body.slice(0, 300) : undefined,
        });
        session.retire();
        throw new Error('Kickstarter returned an unexpected pagination response. Will retry...');
    }

    log.info('Kickstarter pagination request succeeded', {
        page,
        retryCount: request.retryCount,
        reusedProxy,
        durationMillis: Date.now() - requestStartedAt,
    });

    // ON THE FIRST PAGE WE ARE CHECKING IF WE REACHED THE LIMIT
    if (page === 1) {
        log.info(`Page ${page}: Found ${body.total_hits} projects in total.`, {
            totalHits: body.total_hits,
            maximumResults,
            hasMore: body.has_more,
        });
        // If kickstarter contains more then 2400 results for current query, notify user
        // that he will not have all results and that he needs to refine his query.
        if (body.total_hits > maximumResults) notifyAboutMaxResults(body.total_hits, maximumResults);
        totalProjects = Math.min(body.total_hits, maximumResults);
    }
    // ARRAY OF THE PROJECTS FROM THE PAGE
    log.info(`Number of  saved projects: ${savedProjects}`, { 
        savedProjects, 
        totalProjects,
        progress: totalProjects > 0 ? `${Math.round((savedProjects / totalProjects) * 100)}%` : '0%',
    });
    let projectsToSave;
    try {
        const eligibleProjects = body.projects.filter((project) => !isProjectExcluded(project, excludeTerms));
        const excludedProjects = body.projects.length - eligibleProjects.length;
        if (excludedProjects > 0) {
            log.info(`Page ${page}: Excluded ${excludedProjects} projects.`, { page, excludedProjects });
        }
        projectsToSave = eligibleProjects.slice(0, maximumResults - savedProjects)
            .map(cleanProject);
    } catch (e) {
        log.error('Failed to process projects from page', {
            page,
            url: request.url,
            errorMessage: e.message,
            errorStack: e.stack,
            bodyKeys: body ? Object.keys(body) : 'no body',
        });
        throw new Error('The page didn\'t load as expected, Will retry...');
    }

    // SAVING NEEDED NUMBER OF ITEMS
    if (projectsToSave.length > 0) {
        const newProjects = projectsToSave.filter((c) => !savedProjectIds.includes(c.id));
        newProjects.forEach((project) => {
            savedProjectIds.push(project.id);
        });

        await Actor.pushData(newProjects);
        log.info(`Page ${page}: Saved ${newProjects.length} projects.`, {
            page,
            newProjectsCount: newProjects.length,
            totalProjectsToSave: projectsToSave.length,
        });
        if (newProjects.length !== projectsToSave.length) {
            log.info(`Found ${projectsToSave.length - newProjects.length} duplicates in the request.`, {
                duplicatesCount: projectsToSave.length - newProjects.length,
            });
        }

        savedProjects += newProjects.length;
    }
    // FLAG FROM JSON
    const hasMoreResults = body.has_more;
    if (hasMoreResults && savedProjects < totalProjects) {
        page++;
        log.info('Adding next page to queue', { 
            nextPage: page, 
            savedProjects, 
            totalProjects,
            remaining: totalProjects - savedProjects,
        });
        // UPDATING IN THE CURRENT LINK PAGE NUMBER AND ADDING IT TO THE QUEUE
        const nextPageUrl = new URL(request.url);
        nextPageUrl.searchParams.set('page', page);
        const nextPage = nextPageUrl.toString();
        // ADDING TO THE QUEUE
        await requestQueue.addRequest({
            url: nextPage,
            userData: {
                label: 'PAGINATION-LIST',
                page,
                savedProjects,
                maximumResults,
                totalProjects,
                savedProjectIds,
                cookies,
                excludeTerms,
                lastSuccessfulProxyUrl: proxyUrl,
            },
        });
    } else {
        log.info('Pagination complete', { 
            hasMoreResults, 
            savedProjects, 
            totalProjects,
            reason: !hasMoreResults ? 'No more results available' : 'Reached target number of projects',
        });
    }
};
