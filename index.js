/* eslint-disable prefer-rest-params, no-console */

import * as blacklist from './disconnect-blacklist.json';

const formatToUniqueArray = (arr) => [...new Set(arr)];

export const retrieveAllHostnamesByCategories = (categories) => formatToUniqueArray(
  Object.keys(blacklist.categories)
    .filter((categoryName) => categories.includes(categoryName))
    .reduce((companies, categoryName) => companies.concat(blacklist.categories[categoryName]), [])
    .reduce((hostnames, company) => hostnames.concat(Object.values(Object.values(company)[0])[0]), []),
);

export const retrieveAllHostnamesByCompanyNames = (whitelistedCompanies) => formatToUniqueArray(
  Object.keys(blacklist.categories)
    .reduce((companies, categoryName) => companies.concat(blacklist.categories[categoryName]), [])
    .filter((company) => whitelistedCompanies.includes(Object.keys(company)[0]))
    .reduce((hostnames, company) => hostnames.concat(Object.values(Object.values(company)[0])[0]), []),
);

let nativeXMLHttpRequestOpen;
let nativeFetch;

const NoTrackers = {
  disable: ({ categories = [], companies = [], hostnames = [] }) => {

    /* Collect blacklisted hostnames */

    const areInputsEmpty = categories.length + companies.length + hostnames.length === 0;
    let hostnameBlacklist;
    
    // block all trackers if inputs are empty

    if (areInputsEmpty) {
      hostnameBlacklist = retrieveAllHostnamesByCategories(Object.keys(blacklist.categories));
    } else {
      hostnameBlacklist = formatToUniqueArray(
        retrieveAllHostnamesByCategories(categories)
          .concat(retrieveAllHostnamesByCompanyNames(companies))
          .concat(retrieveAllHostnamesByCompanyNames(hostnames))
      );
    }

    /* Intercept xhr */

    nativeXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function NoTrackersXHROpenInterceptor(method, url) {
      const { hostname } = new URL(url);
      if (hostnameBlacklist.includes(hostname)) {
        console.warn(`no-trackers: request ${method} ${url} is blocked`);
        this.abort();
      } else {
        nativeXMLHttpRequestOpen.apply(this, arguments);
      }
    };

    /* Intercept fetch */

    nativeFetch = window.fetch;
    window.fetch = function NoTrackersFetchInterceptor(url, { method }) {
      const { hostname } = new URL(url);
      if (hostnames.includes(hostname)) {
        console.warn(`no-trackers: request ${method} ${url} is blocked`);
        return Promise.resolve();
      }
      return nativeFetch.apply(this, arguments);
    };
  },
  enable: () => {
    if (nativeFetch) {
      window.fetch = nativeFetch;
    }
    if (nativeXMLHttpRequestOpen) {
      XMLHttpRequest.prototype.open = nativeXMLHttpRequestOpen;
    }
  },
};

export default NoTrackers;
