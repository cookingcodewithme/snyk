var policy = require('snyk-policy');
var test = require('tape');
var dir = __dirname + '/fixtures/jsbin-snyk-config';
var extendExpiries = require('./utils').extendExpiries

test('policy is callable', function (t) {
  t.plan(3);
  policy.load(dir).then(function () {
    t.pass('called with string');
  });

  policy.load([dir]).then(function () {
    t.pass('called with array');
  });

  policy.load(dir, { 'ignore-policy': true }).then(function () {
    t.pass('called with string and options');
  });
});

test('test sensibly bails if gets an old .snyk format', function (t) {
  var vulns = require('./fixtures/test-jsbin-vulns-updated.json').vulnerabilities;
  var id = 'npm:semver:20150403';
  var vuln = vulns.filter(function (v) {
    return v.id === id;
  }).pop();

  policy.load(dir).then(function (config) {
    var rule = policy.getByVuln(config, vuln);
    t.equal(id, rule.id);
    t.equal(rule.type, 'ignore', 'rule is correctly flagged as ignore');

    var notfound = policy.getByVuln(config, 'unknown');
    t.equal(notfound, null, 'unknown policies are null');
    t.end();
  }).catch(function (e) {
    console.log(e.stack);
    t.fail('could not load the policy file');
    t.end();
  });
});

test('policy ignores correctly', function (t) {
  var dir = __dirname + '/fixtures/hapi-azure-post-update/';
  var vulns = require(dir + 'test.json');

  policy.load(dir).then(function (config) {
    // strip the ignored modules from the results
    extendExpiries(config);
    vulns = config.filter(vulns);
    t.equal(vulns.vulnerabilities.length, 2, 'only qs vuln should remain');
    t.end();
  }).catch(function (e) {
    console.log(e.stack);
    t.fail('could not load the policy file');
    t.end();
  });
});