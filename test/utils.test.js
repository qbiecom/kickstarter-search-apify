const assert = require('node:assert/strict');
const { test } = require('node:test');

const project = require('./fixtures/project.json');
const { cleanProject } = require('../src/utils');

test('maps a Kickstarter JSON project to actor output', () => {
    const result = cleanProject(project);

    assert.equal(result.id, project.id);
    assert.equal(result.image, project.photo.full);
    assert.equal(result.creatorId, project.creator.id);
    assert.equal(result.creatorName, project.creator.name);
    assert.equal(result.locationName, project.location.displayable_name);
    assert.equal(result.categorySlug, project.category.slug);
    assert.equal(result.url, project.urls.web.project);
    assert.equal(result.title, project.name);
    assert.equal(result.link, project.urls.web.project);
    assert.match(result.description, /A concise project description\./);
    assert.ok(result.created_at_formatted);
    assert.ok(result.launched_at_formatted);
    assert.equal(result.creator, undefined);
    assert.equal(result.location, undefined);
    assert.equal(result.category, undefined);
    assert.equal(result.urls, undefined);
    assert.equal(result.profile, undefined);
});

test('handles missing optional project fields', () => {
    const result = cleanProject({ id: 1 });

    assert.equal(result.image, null);
    assert.equal(result.creatorId, null);
    assert.equal(result.locationId, null);
    assert.equal(result.categoryId, null);
    assert.equal(result.url, null);
    assert.equal(result.title, null);
    assert.equal(result.description, '');
    assert.equal(result.pubDate, null);
    assert.equal(result.created_at_formatted, null);
    assert.equal(result.launched_at_formatted, null);
});
