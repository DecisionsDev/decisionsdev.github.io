# GitHub Pages for [ODMDev.github.io](https://odmdev.github.io)
![Build Status](https://travis-ci.org/ODMDev/odmdev.github.io.svg?branch=source)

## Features
- This pages displayes all repositories from [github.com/ODMDev](https://github.com/ODMDev)
- It allows the user to use a custom filter in the 'Filter Repositories' box.
- It suggests a number of filters based on the prefix ie. selecting the 'Samples' filter box will filter the repositories to only show the repositories prefixed by 'sample'. These filter boxes have to be defined in the code, more details below.
- It also suggests filters based on TOPICS assigned to the repos. As more TOPICS are used, the app will automatically add a filter box for it.
- When one of these filters are selected, the URL changes. This is useful when linking a user to the page with a predefined filter.
- The user is able to sort the repos based on the last time they were updated.

## Configuration
- The configuration is not pushed in the repo. So make sure to make the config each time you clone.
- To make the application works, you should fill the `config.json` file.
- First execute `cp config.json.sample config.json`
- `github_token`: Generate a GitHub Personal access tokens [github.com/settings/tokens](https://github.com/settings/tokens).
- `github_repos_url`: Give the link of your user/org like below:
    - `https://api.github.com/users/<USER_NAME>/repos`
    - `https://api.github.com/orgs/<ORG_NAME>/repos`

## Contributing
- You should use 'source' branch only (github-pages use 'master' for orgs/users).

## Scripting
- The scripting for this specific page was written using the [Angular](https://angularjs.org/) framework
- The [GitHub API](https://developer.github.com/v3/) is called using the service in `js/services/github.js`
- The rest of the logic is contained in the single controller, `js/controllers/MainController.js`

## The Controller
The [GitHub API paginates](https://developer.github.com/v3/#pagination) its responses to HTTP requests. The maximum number of repos displayed per page is 100. Therefore we need to make multiple requesets in order to obtain all the repositores. This is performed in the `getAllGitHubData()` function, by parsing the HTTP response header to see if it refers to a following page. Once there are no more pages, we call the three functions, `generateFilters`, `generateTags` and `pushToArray`.

The primary functions within the controller deal with obtaining, parsing and formatting the list of repositories from the github organisation at [github.com/ODMDev](https://github.com/ODMDev)


## Deployment
- Refer to: https://stanko.github.io/travis-jekyll-and-github-pages/

# Issues and contributions
For issues relating specifically to the Dockerfiles and scripts, please use the [GitHub issue tracker](https://github.com/ODMDev/odmdev.github.io/issues).
We welcome contributions following [our guidelines](CONTRIBUTING.md).

# License
The Dockerfiles and associated scripts found in this project are licensed under the [Apache License 2.0](LICENSE).
