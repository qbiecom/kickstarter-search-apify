const Apify = require('apify');
const moment = require('moment');
const cheerio = require('cheerio');

const { EMPTY_SELECT, LOCATION_SEARCH_ACTOR_ID, DEFAULT_SORT_ORDER, DATE_FORMAT } = require('./consts');
const { statuses, categories, pledges, goals, raised, sorts } = require('./filters');

const { utils: { log, requestAsBrowser } } = Apify;

// Function to remove unnecessary keys from the item object
function cleanProject(project) {
    // Create a new object with cleaned properties
    const cleanedProject = {
        ...project,
        image: project.photo?.full ?? null,
        creatorId: project.creator?.id ?? null,
        creatorName: project.creator?.name ?? null,
        creatorAvatar: project.creator?.avatar?.medium ?? null,
        creatorUrl: project.creator?.urls?.web?.user ?? null,
        locationId: project.location?.id ?? null,
        locationName: project.location?.displayable_name ?? null,
        categoryId: project.category?.id ?? null,
        categoryName: project.category?.name ?? null,
        categorySlug: project.category?.slug ?? null,
        url: project.urls?.web?.project ?? null,
        title: project.name,
        description: `<img src="${project.photo?.full}"> ${project.blurb}`,
        link: project.urls?.web?.project ?? null,
        pubDate: moment.unix(project.launched_at).format(DATE_FORMAT),
        created_at_formatted: moment.unix(project.created_at).format(DATE_FORMAT),
        launched_at_formatted: moment.unix(project.launched_at).format(DATE_FORMAT),
    };

    // Remove unnecessary properties from the cleanedProject object
    delete cleanedProject.creator;
    delete cleanedProject.location;
    delete cleanedProject.category;
    delete cleanedProject.urls;
    delete cleanedProject.profile;

    return cleanedProject;
}

// Function to process location from the input by calling another actor
async function processLocation(location) {
    log.info(`Quering kickstarter for location ID of "${location}"...`, {
        locationQuery: location,
    });

    // Call a separate actor to get the location ID
    const run = await Apify.call(LOCATION_SEARCH_ACTOR_ID, { query: location });
    if (run.status !== 'SUCCEEDED') {
        log.warning(`Actor ${LOCATION_SEARCH_ACTOR_ID} did not finish correctly. Please check your "location" field in the input, and try again.`, {
            actorId: LOCATION_SEARCH_ACTOR_ID,
            runStatus: run.status,
            locationQuery: location,
        });
        return;
    }
    // Get locations
    const { locations } = run.output.body;
    if (!locations.length) {
        log.warning(`Location "${location}" was not found. Please check your "location" field in the input, and try again.`, {
            locationQuery: location,
            locationsFound: 0,
        });
        return;
    }
    // Get the first location
    log.info(`Location found, woe_id is - ${locations[0].id}`, {
        locationId: locations[0].id,
        locationName: locations[0].name || location,
    });
    return locations[0].id;
}

// Function to check the input and generate queryParams based on filled filters
async function parseInput(input) {
    if (!input) {
        log.warning('Key-value store does not contain INPUT. Actor will be stopped.');
        return;
    }
    
    log.info('Parsing input parameters', { 
        inputKeys: Object.keys(input),
    });
    
    const queryParams = {
        woe_id: 0
    };

    // FILTER OUT EMPTY FILTER VALUES
    const filledInFilters = {};
    Object.keys(input).forEach((key) => {
        const filterValue = (typeof (input[key]) === 'string') ? input[key].trim() : input[key];
        if (!filterValue || filterValue === EMPTY_SELECT) return;
        filledInFilters[key] = filterValue;
    });

    log.info('Filtered input parameters', { 
        filledInFilters: Object.keys(filledInFilters),
    });

    // process search term
    if (filledInFilters.query) queryParams.term = filledInFilters.query;

    // process category
    if (filledInFilters.category) {
        const fromInputLowerCase = filledInFilters.category.toLowerCase();
        const foundCategories = categories.filter((category) => {
            return fromInputLowerCase.category === category.id || fromInputLowerCase === category.slug.toLowerCase();
        });

        if (!foundCategories.length) {
            log.warning(`Input parameter "category" contains invalid value: "${filledInFilters.category}".\n
            Please check the input. Actor will be stopped`, {
                providedCategory: filledInFilters.category,
                availableCategories: categories.length,
            });
            return;
        }
        queryParams.category_id = foundCategories[0].id;
    }

    // process status
    if (filledInFilters.status) {
        const state = statuses[filledInFilters.status];
        if (!state) {
            log.warning(`Input parameter "status" contains invalid value: "${filledInFilters.state}".\n
            Please check the input. Actor will be stopped.`, {
                providedStatus: filledInFilters.status,
                availableStatuses: Object.keys(statuses),
            });
            return;
        }
        queryParams.state = state;
    }

    // process pledged
    if (filledInFilters.pledged) {
        const pledged = pledges.indexOf(filledInFilters.pledged.toLowerCase());
        if (pledged === -1) {
            log.warning(`Input parameter "pledged" contains invalid value: "${filledInFilters.pledged}".\n
            Please check the input. Actor will be stopped.`, {
                providedPledged: filledInFilters.pledged,
                availablePledges: pledges,
            });
            return;
        }
        queryParams.pledged = pledged;
    }

    // process goal
    if (filledInFilters.goal) {
        const goal = goals.indexOf(filledInFilters.goal.toLowerCase());
        if (goal === -1) {
            log.warning(`Input parameter goal contains invalid value: "${filledInFilters.goal}". Please check the input. Actor will be stopped.`, {
                providedGoal: filledInFilters.goal,
                availableGoals: goals,
            });
            return;
        }
        queryParams.goal = goal;
    }

    // process raised
    if (filledInFilters.raised) {
        const amountRaised = raised.indexOf(filledInFilters.raised.toLowerCase());
        if (amountRaised === -1) {
            log.warning(`Input parameter "raised" contains invalid value: "${filledInFilters.raised}".\n
            Please check the input. Actor will be finished.`, {
                providedRaised: filledInFilters.raised,
                availableRaised: raised,
            });
            return;
        }
        queryParams.raised = amountRaised;
    }

    // process raised
    if (filledInFilters.sort) {
        const sort = sorts.indexOf(filledInFilters.sort.toLowerCase());
        if (sort === -1) {
            log.warning(`Input parameter "sort" contains invalid value: "${filledInFilters.sort}". Please check the input. Actor will be stopped`, {
                providedSort: filledInFilters.sort,
                availableSorts: sorts,
            });
            return;
        }
        queryParams.sort = filledInFilters.sort.toLowerCase();
    } else {
        queryParams.sort = DEFAULT_SORT_ORDER;
    }

    if (filledInFilters.location) queryParams.woe_id = await processLocation(filledInFilters.location);

    queryParams.page = 1;

    log.info('Input parsing completed', { 
        queryParams,
    });

    return queryParams;
}

// Function to get token and cookies for requests
async function getToken(url, session, proxyConfiguration) {
    const proxyUrl = proxyConfiguration.newUrl(session.id);
    
    log.info('Fetching token and cookies', {
        url,
        sessionId: session.id,
    });
    
    // Query the url and load csrf token from it
    const html = await requestAsBrowser({
        url,
        proxyUrl,
    });

    // Load the seed and cookies from the HTML response
    const $ = cheerio.load(html.body);
    const seed = $('.js-project-group[data-seed]').attr('data-seed');
    const cookies = (html.headers['set-cookie'] || []).map((s) => s.split(';', 2)[0]).join('; ');
    if (!seed) {
        log.error('Could not resolve seed from page', {
            url,
            hasBody: !!html.body,
            bodyLength: html.body ? html.body.length : 0,
            statusCode: html.statusCode,
        });
        throw new Error('Could not resolve seed. Will retry...')
    }
    
    log.info('Token and cookies extracted successfully', {
        hasSeed: !!seed,
        hasCookies: !!cookies,
        cookieCount: cookies ? cookies.split(';').length : 0,
    });
    
    return {
        seed,
        cookies,
    };
}

// Function to inform about the item limit on Kickstarter search
/**
 * Kickstarter has limit of 200 pages (2400 projects) for a search
 * this functions outputs explanation of this to console.
 * @param {Number} foundProjects How many projects were found
 * @param {Number} limit How many projects does kickstarter allow
 * @return {Void}
 */
function notifyAboutMaxResults(foundProjects, limit) {
    log.info('|');
    log.info(`| Found ${foundProjects} projects in total.`);
    log.info(`| Will be output: ${limit} projects.`);
    log.info('| ');
    log.info('|');
    log.warning('Search result limit reached', {
        foundProjects,
        limit,
        message: 'Kickstarter has a limit of 200 pages (2400 projects) per search. To get more results, refine your search query.',
    });
}

const proxyConfiguration = async ({
    proxyConfig,
    required = true,
    force = Apify.isAtHome(),
    blacklist = ['GOOGLESERP'],
    hint = [],
}) => {
    log.info('Configuring proxy', {
        required,
        force,
        hasProxyConfig: !!proxyConfig,
    });
    
    const configuration = await Apify.createProxyConfiguration(proxyConfig);

    // this works for custom proxyUrls
    if (Apify.isAtHome() && required) {
        if (!configuration || (!configuration.usesApifyProxy && (!configuration.proxyUrls || !configuration.proxyUrls.length)) || !configuration.newUrl()) {
            log.error('Proxy configuration validation failed', {
                hasConfiguration: !!configuration,
                usesApifyProxy: configuration?.usesApifyProxy,
                hasProxyUrls: !!(configuration?.proxyUrls && configuration.proxyUrls.length),
                canGenerateUrl: !!configuration?.newUrl(),
            });
            throw new Error('\n=======\nYou must use Apify proxy or custom proxy URLs\n\n=======');
        }
    }

    // check when running on the platform by default
    if (force) {
        // only when actually using Apify proxy it needs to be checked for the groups
        if (configuration && configuration.usesApifyProxy) {
            if (blacklist.some((blacklisted) => (configuration.groups || []).includes(blacklisted))) {
                log.error('Blacklisted proxy group detected', {
                    blacklist,
                    configuredGroups: configuration.groups,
                });
                throw new Error(`\n=======\nThese proxy groups cannot be used in this actor. Choose other group or contact support@apify.com to give you proxy trial:\n\n*  ${blacklist.join('\n*  ')}\n\n=======`);
            }

            // specific non-automatic proxy groups like RESIDENTIAL, not an error, just a hint
            if (hint.length && !hint.some((group) => (configuration.groups || []).includes(group))) {
                Apify.utils.log.info(`\n=======\nYou can pick specific proxy groups for better experience:\n\n*  ${hint.join('\n*  ')}\n\n=======`);
            }
        }
    }

    log.info('Proxy configuration completed', {
        usesApifyProxy: configuration?.usesApifyProxy,
        groups: configuration?.groups,
    });

    return configuration;
};

module.exports = {
    cleanProject,
    parseInput,
    getToken,
    notifyAboutMaxResults,
    proxyConfiguration,
};
