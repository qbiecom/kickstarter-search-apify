const { Actor, log } = require('apify');
const querystring = require('querystring');
const { gotScraping } = require('got-scraping');

const { cleanProject, getToken, notifyAboutMaxResults } = require('./utils');
const { BASE_URL, MAX_PAGES, PROJECTS_PER_PAGE } = require('./consts');

exports.handleStart = async ({ request, session }, query, requestQueue, proxyConfig, maxResults) => {
    log.info('Handling START phase - getting TOKEN and COOKIES', { 
        url: request.url,
        sessionId: session.id,
    });
    
    // on this phase - getting TOKEN AND COOKIES
    const { seed, cookies } = await getToken(request.url, session, proxyConfig);

    log.info('Token and cookies obtained successfully', { seed, sessionId: session.id });

    const page = 1;
    const totalProjects = 0;
    const savedProjects = 0;
    const maximumResults = Math.min(maxResults, MAX_PAGES * PROJECTS_PER_PAGE);
    const savedProjectIds = [];

    const params = querystring.stringify({
        ...query,
        page,
        seed,
    });
    const listUrl = `${BASE_URL}${params}`;

    log.info('Adding first pagination page to queue', { 
        listUrl, 
        page, 
        maximumResults,
    });

    // ADDING TO THE QUEUE FIRST PAGINATION PAGE WITH JSON
    await requestQueue.addRequest({
        url: listUrl,
        userData: {
            cookies,
            page,
            label: 'PAGINATION-LIST',
            totalProjects,
            savedProjects,
            maximumResults,
            savedProjectIds,
        },
    });
};

exports.handlePagination = async ({ request, session }, requestQueue, proxyConfiguration) => {
    let { page, totalProjects, savedProjects } = request.userData;
    const { cookies, maximumResults, savedProjectIds } = request.userData;

    log.info('Handling pagination page', { 
        page, 
        url: request.url,
        sessionId: session.id,
        savedProjects,
        totalProjects,
    });

    // MAKING REQUEST => JSON OBJECT IN RESPONSE
    const response = await gotScraping({
        url: request.url,
        proxyUrl: proxyConfiguration.newUrl(session.id),
        headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            Cookie: cookies,
        },
        responseType: 'json',
    });
    const body = response.body;

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
        projectsToSave = body.projects.slice(0, maximumResults - savedProjects)
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

    // GETTING NEW SEED (TOKEN) FROM JSON
    const { seed } = body;

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
        // UPDATING IN THE CURRENT LINK PAGE NUMBER AND SEED AND ADDING IT TO THE QUEUE
        const nextPage = request.url.replace(request.url.match(/page=([0-9.]+)/)[0], `page=${page}`)
            .replace(request.url.match(/seed=([0-9.]+)/)[0], `seed=${seed}`);
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
