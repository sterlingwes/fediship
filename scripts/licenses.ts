import {License, PackageDetail} from '../src/screens/about/oss.types';

const sourceMapResult = require('../build/explorer.json');
const licenseResult = require('../build/licenses.json');

const [bundleResult] = sourceMapResult.results;

const pkgName = (filePath: string) => {
  const [, after] = filePath.split('node_modules/');
  if (!after) {
    return;
  }
  const [first, second] = after.split('/');
  if (first.startsWith('@')) {
    return `${first}/${second}`;
  }
  return first;
};

const findLicense = (name: string) =>
  (licenseResult as License[]).find(license => license.libraryName === name);

const sizeByPackage = Object.keys(bundleResult.files).reduce(
  (acc, filePath) => {
    if (filePath.startsWith('[')) {
      return acc;
    }

    const name = pkgName(filePath);
    if (!name) {
      return acc;
    }

    const detail = bundleResult.files[filePath] as {size: number};
    if (!acc[name]) {
      const license = findLicense(name);

      return {
        ...acc,
        [name]: {
          name,
          license: license?._license,
          repo: license?.repository,
          size: detail.size,
        },
      };
    }

    return {
      ...acc,
      [name]: {...acc[name], size: acc[name].size + detail.size},
    };
  },
  {} as Record<string, PackageDetail>,
);

export {};

const sizeRank = Object.entries(sizeByPackage)
  .sort((a, b) => b[1].size - a[1].size)
  .map(tuple => tuple[1]);

console.log(JSON.stringify(sizeRank, null, 2));
