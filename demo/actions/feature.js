const ciGulp = require('ci-gulp');

ciGulp.action('feature',
    [
        // Step 1: Checkout
        ['git:checkout:develop'],
        // Step 2: Verification
        // TODO ['github-ticket:is-owned', 'github-ticket:state-is:new'],
        // Step 3: Begin task
        ['git:branch:feature', 'github-ticket:state:open'],
    ], {
        featureId: 'feature-id',
        codeFreezeBranch: (args) => `fb-${args.featureId}`
    }
);