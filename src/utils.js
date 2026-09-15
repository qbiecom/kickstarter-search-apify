const { Actor, log } = require('apify');
const moment = require('moment');

const { EMPTY_SELECT, LOCATION_SEARCH_ACTOR_ID, DEFAULT_SORT_ORDER, DATE_FORMAT } = require('./consts');
const { statuses, categories, pledges, goals, raised, sorts } = require('./filters');

let _gotScrapingModule = null;
async function getGotScraping() {
    if (_gotScrapingModule) return _gotScrapingModule;
    _gotScrapingModule = await import('got-scraping');
    return _gotScrapingModule;
}

function stringifyDiscoverQuery(query) {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
            value.forEach((item) => params.append(`${key}[]`, item));
            return;
        }
        params.append(key, value);
    });

    return params.toString();
}

function formatTimestamp(timestamp) {
    return Number.isFinite(timestamp) ? moment.unix(timestamp).format(DATE_FORMAT) : null;
}

// Function to remove unnecessary keys from the item object
function cleanProject(project = {}) {
    const image = project.photo?.full ?? null;
    const blurb = project.blurb ?? '';

    // Create a new object with cleaned properties
    const cleanedProject = {
        ...project,
        image,
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
        title: project.name ?? null,
        description: `${image ? `<img src="${image}"> ` : ''}${blurb}`,
        link: project.urls?.web?.project ?? null,
        pubDate: formatTimestamp(project.launched_at),
        created_at_formatted: formatTimestamp(project.created_at),
        launched_at_formatted: formatTimestamp(project.launched_at),
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
    const run = await Actor.call(LOCATION_SEARCH_ACTOR_ID, { query: location });
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
    
    const queryParams = {};

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
            return fromInputLowerCase === String(category.id) || fromInputLowerCase === category.slug.toLowerCase();
        });

        if (!foundCategories.length) {
            log.warning(`Input parameter "category" contains invalid value: "${filledInFilters.category}".\n
            Please check the input. Actor will be stopped`, {
                providedCategory: filledInFilters.category,
                availableCategories: categories.length,
            });
            return;
        }
        queryParams.category_id = [foundCategories[0].id];
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
        queryParams.state = [state];
    } else {
        queryParams.state = ['upcoming', 'live', 'late_pledge'];
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
        queryParams.pledged = [pledged];
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
        queryParams.goal = [goal];
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

async function getSessionCookies(url, session, proxyConfiguration) {
    const proxyUrl = await proxyConfiguration.newUrl(session.id);
    const { gotScraping } = await getGotScraping();
    const response = await gotScraping({
        url,
        proxyUrl,
        responseType: 'text',
    });

    return (response.headers['set-cookie'] || [])
        .map((cookie) => cookie.split(';', 2)[0])
        .join('; ');
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
    log.warning('Search result limit reached', {
        foundProjects,
        limit,
        message: 'Kickstarter has a limit of 200 pages (2400 projects) per search. To get more results, refine your search query.',
    });
}

const proxyConfiguration = async ({
    proxyConfig,
    required = true,
    force = Actor.isAtHome(),
    blacklist = ['GOOGLESERP'],
    hint = [],
}) => {
    log.info('Configuring proxy', {
        required,
        force,
        hasProxyConfig: !!proxyConfig,
    });
    
    const configuration = await Actor.createProxyConfiguration(proxyConfig);

    // this works for custom proxyUrls
    if (Actor.isAtHome() && required) {
        const proxyUrl = configuration ? await configuration.newUrl() : null;
        if (!configuration || (!configuration.usesApifyProxy && (!configuration.proxyUrls || !configuration.proxyUrls.length)) || !proxyUrl) {
            log.error('Proxy configuration validation failed', {
                hasConfiguration: !!configuration,
                usesApifyProxy: configuration?.usesApifyProxy,
                hasProxyUrls: !!(configuration?.proxyUrls && configuration.proxyUrls.length),
                canGenerateUrl: !!proxyUrl,
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
                log.info(`\n=======\nYou can pick specific proxy groups for better experience:\n\n*  ${hint.join('\n*  ')}\n\n=======`);
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
    getSessionCookies,
    stringifyDiscoverQuery,
    notifyAboutMaxResults,
    proxyConfiguration,
};
